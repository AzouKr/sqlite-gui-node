import logger from "./logger"; // Assuming logger is imported from a separate file
import * as fs from "fs";
import * as path from "path";
import { quoteColumn as q } from "./helpers";

import type { Database } from "sqlite3";

// Interface for a Query object (optional for improved type safety)
interface Query {
  id: number;
  name: string;
  sqlstatement: string;
}

// Interface for a ColumnInfo object (optional for improved type safety)
interface ColumnInfo {
  field: string;
  type: string;
  fk?: any[];
}

// Define the type for the foreign key information
interface ForeignKeyInfo {
  table: string;
  from: string;
  to: string;
}

// Define the return type for the fetchTableForeignKeys function
interface FetchTableForeignKeysResult {
  bool: boolean;
  data?: ForeignKeyInfo[];
  error?: string;
}

interface Table {
  name: string;
  sql: string;
}

interface Column {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: any;
  pk: number;
}

interface Row {
  [key: string]: any;
}

async function InitializeDB(db: Database): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.get(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='query'",
        (err, row) => {
          if (err) {
            logger.error("Error checking for query:", err.message);
            reject(err);
            return;
          }
          if (!row || row === undefined) {
            db.run(
              `
              CREATE TABLE IF NOT EXISTS query (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                sqlstatement TEXT
              )
            `,
              (err) => {
                if (err) {
                  logger.error("Error creating query:", err.message);
                  reject(err);
                  return;
                }
                resolve(); // No error, table created successfully
              }
            );
          } else {
            resolve(); // No error, table already exists
          }
        }
      );
    });
  });
}

function insertQuery(
  db: Database,
  name: string,
  sqlStatement: string
): Promise<{ bool: boolean; error?: string }> {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO query (name, sqlstatement) VALUES (?, ?)`,
      [name, sqlStatement],
      (error) => {
        if (error) {
          logger.error("SQL Statement : " + sqlStatement);
          logger.error(error.message);
          reject({ bool: false, error: error.message });
          return;
        } else {
          resolve({ bool: true });
        }
      }
    );
  });
}

function fetchQueries(
  db: Database
): Promise<{ bool: boolean; data?: Query[] }> {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM query`, function (error, rows: any) {
      if (error) {
        logger.error("Error while fetching table");
        logger.error(error.message);
        reject({ bool: false, error: error.message });
        return;
      } else {
        resolve({ bool: true, data: rows });
      }
    });
  });
}

function fetchAllTables(
  db: Database
): Promise<{ bool: boolean; data?: string[] }> {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT name FROM sqlite_master WHERE type='table'",
      function (error, rows: any) {
        if (error) {
          logger.error("Error while fetching tables");
          logger.error(error.message);
          reject({ bool: false, error: error.message });
          return;
        } else {
          resolve({ bool: true, data: rows });
        }
      }
    );
  });
}

async function fetchTable(
  db: Database,
  table: string,
  pagination = { page: 1, perPage: 50 }
): Promise<{ bool: boolean; data?: any[], meta: any }> {
  const page = pagination.page;
  const limit = pagination.perPage;
  const offset = (page - 1) * limit;
  console.log("🚀 ~ fetchTable ~ offset:", { offset, limit , page})
  
  const [rows, total] = await Promise.all([
    new Promise<any[]>((resolve, reject) => {
      db.all(`SELECT * FROM ${q(table)} LIMIT ${limit} OFFSET ${offset}`, function (error, rows) {
        if (error) {
          logger.error("Error while fetching table");
          logger.error(error.message);
          reject({ bool: false, error: error.message });

          return;
        } else {
          resolve(rows);
        }
      });
    }),
    new Promise((resolve, reject) => {
      db.get(`SELECT COUNT(*) FROM ${q(table)};`, function(error, res: Record<string, number>) {
        if (error) {
          logger.error("Error while fetching table");
          logger.error(error.message);
          reject({ bool: false, error: error.message });

          return;
        } else {
          resolve(Object.values(res)[0] ?? 0);
        }
      })
    }),
  ]);

  return {
    bool: true, 
    data: rows || [], 
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(Number(total) / limit)
    }
  }

}

function fetchRecord(
  db: Database,
  table: string,
  label: string,
  id: number | string
): Promise<{ bool: boolean; data?: any[] }> {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM ${q(table)} WHERE ${label} = ${
        typeof id === "string" ? `'${id}'` : id
      }`,
      function (error, rows: any) {
        if (error) {
          logger.error("Error while fetching record");
          logger.error(error.message);
          reject({ bool: false, error: error.message });
          return;
        } else {
          resolve({ bool: true, data: rows });
        }
      }
    );
  });
}

function fetchTableInfo(
  db: Database,
  table: string
): Promise<{ bool: boolean; data?: ColumnInfo[] }> {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${q(table)})`, function (error, rows: any) {
      if (error) {
        logger.error("Error while fetching table info");
        logger.error(error.message);
        reject({ bool: false, error: error.message });
      } else {
        // Filter out the auto-increment column
        // const filteredColumns = rows.filter(
        //   (row: any) =>
        //     !(
        //       (row.pk > 0 && row.type.toUpperCase() === "INTEGER") ||
        //       row.type.toUpperCase() === "DATETIME"
        //     )
        // );

        // Map the remaining columns to an array of column objects with name and type
        const tableInfo = rows.map((row: any) => ({
          field: row.name,
          type: row.type,
        }));

        if (tableInfo.length === 0) {
          reject({
            bool: false,
            error: "No columns to select (all columns are auto-increment).",
          });
        } else {
          resolve({ bool: true, data: tableInfo });
        }
      }
    });
  });
}

function fetchAllTableInfo(
  db: Database,
  table: string
): Promise<{ bool: boolean; data?: ColumnInfo[] }> {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${q(table)})`, function (error, rows: any) {
      if (error) {
        logger.error("Error while fetching table info");
        logger.error(error.message);
        reject({ bool: false, error: error.message });
      } else {
        // Map the columns to an array of column objects with name and type
        const tableInfo = rows.map((row: any) => ({
          field: row.name,
          type: row.type,
        }));

        if (tableInfo.length === 0) {
          reject({
            bool: false,
            error: "No columns to select (all columns are auto-increment).",
          });
        } else {
          resolve({ bool: true, data: tableInfo });
        }
      }
    });
  });
}

// Function to fetch foreign key info of a table
async function fetchTableForeignKeys(
  db: Database,
  table: string
): Promise<FetchTableForeignKeysResult> {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA foreign_key_list(${q(table)})`, function (error, rows: any) {
      if (error) {
        console.error("Error while fetching foreign key info");
        console.error(error.message);
        reject({ bool: false, error: error.message });
      } else {
        if (rows.length === 0) {
          resolve({ bool: false, data: [] });
        } else {
          const foreignKeys = rows.map((row: any) => ({
            table: row.table,
            from: row.from,
            to: row.to,
          }));

          resolve({ bool: true, data: foreignKeys });
        }
      }
    });
  });
}

function fetchFK(
  db: Database,
  table: string,
  column: string
): Promise<{ bool: boolean; data: any[] }> {
  return new Promise((resolve, reject) => {
    db.all(`SELECT ${q(column)} from ${q(table)}`, function (error, rows) {
      if (error) {
        logger.error("Error while fetching Foreign keys");
        logger.error(error.message);
        reject({ bool: false, data: [], error: error.message });
        return;
      } else {
        resolve({ bool: true, data: rows });
      }
    });
  });
}

function runQuery(
  db: Database,
  sqlStatement: string
): Promise<{ bool: boolean; error?: string }> {
  return new Promise((resolve, reject) => {
    db.run(sqlStatement, function (error) {
      if (error) {
        logger.error("SQL Statement : " + sqlStatement);
        logger.error(error.message);
        reject({ bool: false, error: error.message });
        return;
      } else {
        resolve({ bool: true });
      }
    });
  });
}

function runSelectQuery(
  db: Database,
  sqlStatement: string
): Promise<{ bool: boolean; data?: any[] }> {
  return new Promise((resolve, reject) => {
    db.all(sqlStatement, function (error, rows) {
      if (error) {
        logger.error("SQL Statement : " + sqlStatement);
        logger.error(error.message);
        reject({ bool: false, error: error.message });
        return;
      } else {
        resolve({ bool: true, data: rows });
      }
    });
  });
}

function checkColumnHasDefault(
  db: Database,
  tableName: string,
  columnType: string,
  columnName: string
): Promise<{ bool: boolean; message?: string; error?: string }> {
  return new Promise((resolve, reject) => {
    try {
      // Construct the SQL query to check if the column has a default value
      const sql = `
                SELECT sql
                FROM sqlite_master
                WHERE type = 'table' AND name = '${q(tableName)}'
            `;

      // Execute the SQL query
      db.get(sql, [], (err, row: any) => {
        if (err) {
          reject({
            bool: false,
            message: "Error while executing query",
            error: err.message,
          });
          return;
        }

        if (!row) {
          resolve({ bool: false, message: "Table not found" });
          return;
        }
        // Check if the SQL definition contains the column name and the word "DEFAULT"
        const hasDefault = row.sql.includes(
          `${q(columnName)} ${columnType} DEFAULT`
        );

        // Return the result
        resolve({ bool: hasDefault, message: "" });
      });
    } catch (error: any) {
      reject({
        bool: false,
        message: "Error while executing query",
        error: error.message,
      });
    }
  });
}

function deleteFromTable(
  db: Database,
  name: string,
  id: number | string
): Promise<{ bool: boolean; error?: string }> {
  // console.log(sqlStatement);
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM ${name} WHERE id = ${
        typeof id === "string" ? `'${id}'` : id
      };`,
      function (error) {
        if (error) {
          logger.error("Error while deleting");
          logger.error(error.message);
          reject({ bool: false, error: error.message });
          return;
        } else {
          resolve({ bool: true });
        }
      }
    );
  });
}

function exportDatabaseToSQL(
  db: Database
): Promise<{ bool: boolean; filePath?: string; error?: string }> {
  return new Promise((resolve, reject) => {
    const outputPath = path.resolve(
      __dirname,
      "..",
      "..",
      "public",
      "output.sql"
    );
    let sql = "";

    db.serialize(() => {
      db.all(
        "SELECT name, sql FROM sqlite_master WHERE type='table'",
        (err, tables: Table[]) => {
          if (err) {
            reject({ bool: false, error: err.message });
            return;
          }

          let pendingTables = tables.length;

          tables.forEach((table) => {
            const tableName = table.name;
            const createTableSQL = table.sql;

            sql += `-- Dumping data for table ${q(tableName)}\n`;
            sql += `${createTableSQL};\n`;

            db.all(
              `PRAGMA table_info(${q(tableName)})`,
              (err, columns: Column[]) => {
                if (err) {
                  reject({ bool: false, error: err.message });
                  return;
                }

                columns.forEach((column) => {
                  sql += `-- ${column.cid} | ${column.name} | ${column.type} | ${column.notnull} | ${column.dflt_value} | ${column.pk}\n`;
                });

                db.all(`SELECT * FROM ${q(tableName)}`, (err, rows: Row[]) => {
                  if (err) {
                    reject({ bool: false, error: err.message });
                    return;
                  }

                  rows.forEach((row) => {
                    const columns = Object.keys(row).map(q).join(", ");
                    const values = Object.values(row)
                      .map((value) => `'${value}'`)
                      .join(", ");
                    sql += `INSERT INTO ${q(
                      tableName
                    )} (${columns}) VALUES (${values});\n`;
                  });

                  pendingTables -= 1;

                  if (pendingTables === 0) {
                    fs.writeFile(outputPath, sql, (err) => {
                      if (err) {
                        reject({ bool: false, error: err.message });
                        return;
                      }

                      resolve({ bool: true, filePath: outputPath });
                    });
                  }
                });
              }
            );
          });
        }
      );
    });
  });
}

export default {
  checkColumnHasDefault,
  fetchAllTables,
  fetchTable,
  fetchTableInfo,
  fetchAllTableInfo,
  deleteFromTable,
  fetchRecord,
  runQuery,
  runSelectQuery,
  InitializeDB,
  insertQuery,
  fetchQueries,
  fetchTableForeignKeys,
  fetchFK,
  exportDatabaseToSQL,
};
