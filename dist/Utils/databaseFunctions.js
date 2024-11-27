"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("./logger")); // Assuming logger is imported from a separate file
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const helpers_1 = require("./helpers");
function InitializeDB(db) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='query'", (err, row) => {
                    if (err) {
                        logger_1.default.error("Error checking for query:", err.message);
                        reject(err);
                        return;
                    }
                    if (!row || row === undefined) {
                        db.run(`
              CREATE TABLE IF NOT EXISTS query (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                sqlstatement TEXT
              )
            `, (err) => {
                            if (err) {
                                logger_1.default.error("Error creating query:", err.message);
                                reject(err);
                                return;
                            }
                            resolve(); // No error, table created successfully
                        });
                    }
                    else {
                        resolve(); // No error, table already exists
                    }
                });
            });
        });
    });
}
function insertQuery(db, name, sqlStatement) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO query (name, sqlstatement) VALUES (?, ?)`, [name, sqlStatement], (error) => {
            if (error) {
                logger_1.default.error("SQL Statement : " + sqlStatement);
                logger_1.default.error(error.message);
                reject({ bool: false, error: error.message });
                return;
            }
            else {
                resolve({ bool: true });
            }
        });
    });
}
function fetchQueries(db) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM query`, function (error, rows) {
            if (error) {
                logger_1.default.error("Error while fetching table");
                logger_1.default.error(error.message);
                reject({ bool: false, error: error.message });
                return;
            }
            else {
                resolve({ bool: true, data: rows });
            }
        });
    });
}
function fetchAllTables(db) {
    return new Promise((resolve, reject) => {
        db.all("SELECT name FROM sqlite_master WHERE type='table'", function (error, rows) {
            if (error) {
                logger_1.default.error("Error while fetching tables");
                logger_1.default.error(error.message);
                reject({ bool: false, error: error.message });
                return;
            }
            else {
                resolve({ bool: true, data: rows });
            }
        });
    });
}
function fetchTable(db, table) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM ${(0, helpers_1.quoteColumn)(table)}`, function (error, rows) {
            if (error) {
                logger_1.default.error("Error while fetching table");
                logger_1.default.error(error.message);
                reject({ bool: false, error: error.message });
                return;
            }
            else {
                resolve({ bool: true, data: rows });
            }
        });
    });
}
function fetchRecord(db, table, label, id) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM ${(0, helpers_1.quoteColumn)(table)} WHERE ${label} = ${typeof id === "string" ? `'${id}'` : id}`, function (error, rows) {
            if (error) {
                logger_1.default.error("Error while fetching record");
                logger_1.default.error(error.message);
                reject({ bool: false, error: error.message });
                return;
            }
            else {
                resolve({ bool: true, data: rows });
            }
        });
    });
}
function fetchTableInfo(db, table) {
    return new Promise((resolve, reject) => {
        db.all(`PRAGMA table_info(${(0, helpers_1.quoteColumn)(table)})`, function (error, rows) {
            if (error) {
                logger_1.default.error("Error while fetching table info");
                logger_1.default.error(error.message);
                reject({ bool: false, error: error.message });
            }
            else {
                // Filter out the auto-increment column
                // const filteredColumns = rows.filter(
                //   (row: any) =>
                //     !(
                //       (row.pk > 0 && row.type.toUpperCase() === "INTEGER") ||
                //       row.type.toUpperCase() === "DATETIME"
                //     )
                // );
                // Map the remaining columns to an array of column objects with name and type
                const tableInfo = rows.map((row) => ({
                    field: row.name,
                    type: row.type,
                }));
                if (tableInfo.length === 0) {
                    reject({
                        bool: false,
                        error: "No columns to select (all columns are auto-increment).",
                    });
                }
                else {
                    resolve({ bool: true, data: tableInfo });
                }
            }
        });
    });
}
function fetchAllTableInfo(db, table) {
    return new Promise((resolve, reject) => {
        db.all(`PRAGMA table_info(${(0, helpers_1.quoteColumn)(table)})`, function (error, rows) {
            if (error) {
                logger_1.default.error("Error while fetching table info");
                logger_1.default.error(error.message);
                reject({ bool: false, error: error.message });
            }
            else {
                // Map the columns to an array of column objects with name and type
                const tableInfo = rows.map((row) => ({
                    field: row.name,
                    type: row.type,
                }));
                if (tableInfo.length === 0) {
                    reject({
                        bool: false,
                        error: "No columns to select (all columns are auto-increment).",
                    });
                }
                else {
                    resolve({ bool: true, data: tableInfo });
                }
            }
        });
    });
}
// Function to fetch foreign key info of a table
function fetchTableForeignKeys(db, table) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            db.all(`PRAGMA foreign_key_list(${(0, helpers_1.quoteColumn)(table)})`, function (error, rows) {
                if (error) {
                    console.error("Error while fetching foreign key info");
                    console.error(error.message);
                    reject({ bool: false, error: error.message });
                }
                else {
                    if (rows.length === 0) {
                        resolve({ bool: false, data: [] });
                    }
                    else {
                        const foreignKeys = rows.map((row) => ({
                            table: row.table,
                            from: row.from,
                            to: row.to,
                        }));
                        resolve({ bool: true, data: foreignKeys });
                    }
                }
            });
        });
    });
}
function fetchFK(db, table, column) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT ${(0, helpers_1.quoteColumn)(column)} from ${(0, helpers_1.quoteColumn)(table)}`, function (error, rows) {
            if (error) {
                logger_1.default.error("Error while fetching Foreign keys");
                logger_1.default.error(error.message);
                reject({ bool: false, data: [], error: error.message });
                return;
            }
            else {
                resolve({ bool: true, data: rows });
            }
        });
    });
}
function runQuery(db, sqlStatement) {
    return new Promise((resolve, reject) => {
        db.run(sqlStatement, function (error) {
            if (error) {
                logger_1.default.error("SQL Statement : " + sqlStatement);
                logger_1.default.error(error.message);
                reject({ bool: false, error: error.message });
                return;
            }
            else {
                resolve({ bool: true });
            }
        });
    });
}
function runSelectQuery(db, sqlStatement) {
    return new Promise((resolve, reject) => {
        db.all(sqlStatement, function (error, rows) {
            if (error) {
                logger_1.default.error("SQL Statement : " + sqlStatement);
                logger_1.default.error(error.message);
                reject({ bool: false, error: error.message });
                return;
            }
            else {
                resolve({ bool: true, data: rows });
            }
        });
    });
}
function checkColumnHasDefault(db, tableName, columnType, columnName) {
    return new Promise((resolve, reject) => {
        try {
            // Construct the SQL query to check if the column has a default value
            const sql = `
                SELECT sql
                FROM sqlite_master
                WHERE type = 'table' AND name = '${(0, helpers_1.quoteColumn)(tableName)}'
            `;
            // Execute the SQL query
            db.get(sql, [], (err, row) => {
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
                const hasDefault = row.sql.includes(`${(0, helpers_1.quoteColumn)(columnName)} ${columnType} DEFAULT`);
                // Return the result
                resolve({ bool: hasDefault, message: "" });
            });
        }
        catch (error) {
            reject({
                bool: false,
                message: "Error while executing query",
                error: error.message,
            });
        }
    });
}
function deleteFromTable(db, name, id) {
    // console.log(sqlStatement);
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM ${name} WHERE id = ${id};`, function (error) {
            if (error) {
                logger_1.default.error("Error while deleting");
                logger_1.default.error(error.message);
                reject({ bool: false, error: error.message });
                return;
            }
            else {
                resolve({ bool: true });
            }
        });
    });
}
function exportDatabaseToSQL(db) {
    return new Promise((resolve, reject) => {
        const outputPath = path.resolve(__dirname, "..", "..", "public", "output.sql");
        let sql = "";
        db.serialize(() => {
            db.all("SELECT name, sql FROM sqlite_master WHERE type='table'", (err, tables) => {
                if (err) {
                    reject({ bool: false, error: err.message });
                    return;
                }
                let pendingTables = tables.length;
                tables.forEach((table) => {
                    const tableName = table.name;
                    const createTableSQL = table.sql;
                    sql += `-- Dumping data for table ${(0, helpers_1.quoteColumn)(tableName)}\n`;
                    sql += `${createTableSQL};\n`;
                    db.all(`PRAGMA table_info(${(0, helpers_1.quoteColumn)(tableName)})`, (err, columns) => {
                        if (err) {
                            reject({ bool: false, error: err.message });
                            return;
                        }
                        columns.forEach((column) => {
                            sql += `-- ${column.cid} | ${column.name} | ${column.type} | ${column.notnull} | ${column.dflt_value} | ${column.pk}\n`;
                        });
                        db.all(`SELECT * FROM ${(0, helpers_1.quoteColumn)(tableName)}`, (err, rows) => {
                            if (err) {
                                reject({ bool: false, error: err.message });
                                return;
                            }
                            rows.forEach((row) => {
                                const columns = Object.keys(row).map(helpers_1.quoteColumn).join(", ");
                                const values = Object.values(row)
                                    .map((value) => `'${value}'`)
                                    .join(", ");
                                sql += `INSERT INTO ${(0, helpers_1.quoteColumn)(tableName)} (${columns}) VALUES (${values});\n`;
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
                    });
                });
            });
        });
    });
}
exports.default = {
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
