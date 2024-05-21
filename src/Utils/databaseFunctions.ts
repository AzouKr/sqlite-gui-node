import * as sqlite3 from "sqlite3"; // Assuming you're using sqlite3
import logger from "./logger"; // Assuming logger is imported from a separate file
import { AnyARecord } from "dns";

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
}

async function InitializeDB(db: sqlite3.Database): Promise<void> {
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
  db: sqlite3.Database,
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
  db: sqlite3.Database
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
  db: sqlite3.Database
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

function fetchTable(
  db: sqlite3.Database,
  table: string
): Promise<{ bool: boolean; data?: any[] }> {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM ${table}`, function (error, rows) {
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

function fetchRecord(
  db: sqlite3.Database,
  table: string,
  id: number
): Promise<{ bool: boolean; data?: any[] }> {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM ${table} WHERE id = ${id}`,
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
  db: sqlite3.Database,
  table: string
): Promise<{ bool: boolean; data?: ColumnInfo[] }> {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${table})`, function (error, rows: any) {
      if (error) {
        logger.error("Error while fetching table info");
        logger.error(error.message);
        reject({ bool: false, error: error.message });
      } else {
        // Filter out the auto-increment column
        const filteredColumns = rows.filter(
          (row: any) => !(row.pk > 0 && row.type.toUpperCase() === "INTEGER")
        );

        // Map the remaining columns to an array of column objects with name and type
        const tableInfo = filteredColumns.map((row: any) => ({
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

function insertTable(
  db: sqlite3.Database,
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

function runQuery(
  db: sqlite3.Database,
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
  db: sqlite3.Database,
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
  db: sqlite3.Database,
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
                WHERE type = 'table' AND name = '${tableName}'
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
          `${columnName} ${columnType} DEFAULT`
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
  db: sqlite3.Database,
  name: string,
  id: number
): Promise<{ bool: boolean; error?: string }> {
  // console.log(sqlStatement);
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM ${name} WHERE id = ${id};`, function (error) {
      if (error) {
        logger.error("Error while deleting");
        logger.error(error.message);
        reject({ bool: false, error: error.message });
        return;
      } else {
        resolve({ bool: true });
      }
    });
  });
}

export default {
  checkColumnHasDefault,
  fetchAllTables,
  fetchTable,
  insertTable,
  fetchTableInfo,
  deleteFromTable,
  fetchRecord,
  runQuery,
  runSelectQuery,
  InitializeDB,
  insertQuery,
  fetchQueries,
};
