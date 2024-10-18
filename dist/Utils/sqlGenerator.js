"use strict";
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
const databaseFunctions_1 = __importDefault(require("./databaseFunctions"));
// Consider null, undefined and "" as empty, but not 0
const isEmpty = (value) => !value && value !== 0;
const quoteValue = (item) => {
    const shouldQuote = item.type === "text" ||
        item.type === "blob" ||
        item.type.match(/^varchar/i);
    if (isEmpty(item.value))
        return "NULL";
    return shouldQuote
        ? `'${String(item.value).replace(/'/g, "''")}'`
        : String(item.value);
};
const quoteColumn = (columnOrTable) => "`" + columnOrTable + "`";
function generateInsertSQL(db, tableName, data) {
    return __awaiter(this, void 0, void 0, function* () {
        // Extract field names and escape values (optional for TEXT and BLOB)
        const columns = [];
        const values = [];
        yield Promise.all(data.map((item) => __awaiter(this, void 0, void 0, function* () {
            const hasDefault = yield databaseFunctions_1.default.checkColumnHasDefault(db, tableName, item.type.toUpperCase(), item.field);
            if (isEmpty(item.value) && hasDefault.bool)
                return;
            columns.push(quoteColumn(item.field));
            values.push(quoteValue(item));
        })));
        // Form the SQL statement
        const sql = `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${values.join(", ")});`;
        return sql;
    });
}
function generateUpdateSQL(tableName, data, id, id_label) {
    // Extract field names and values with proper handling
    const setClauses = data
        .map((item) => `${quoteColumn(item.field)} = ${quoteValue(item)}`)
        .join(", ");
    // Form the SQL statement
    const sql = `UPDATE ${quoteColumn(tableName)} SET ${setClauses} WHERE ${id_label} = ${id};`;
    return sql;
}
function generateCreateTableSQL(tableName, data) {
    // Map through data to generate column definitions
    const fk_array = [];
    const columnDefinitions = data
        .map((item) => {
        let columnType;
        if (item.fk !== "No") {
            fk_array.push(item.fk);
        }
        switch (item.type) {
            case "TEXT":
                columnType = "TEXT";
                break;
            case "INTEGER":
                columnType = "INTEGER";
                break;
            case "REAL":
                columnType = "REAL";
                break;
            case "DATE":
                columnType = "DATETIME DEFAULT CURRENT_TIMESTAMP";
                break;
            default:
                throw new Error(`Unknown type: ${item.type}`);
        }
        let columnDefinition = `${quoteColumn(item.name)} ${columnType}`;
        if (item.pk) {
            columnDefinition += ` ${item.pk}`; // Include primary key constraint
        }
        if (item.default !== null && item.default !== undefined) {
            columnDefinition += ` DEFAULT ${item.default}`; // Include default value
        }
        return columnDefinition;
    })
        .join(", ");
    // Form the SQL statement
    let sql;
    if (fk_array.length !== 0) {
        sql = `CREATE TABLE IF NOT EXISTS ${quoteColumn(tableName)} (${columnDefinitions} ${"," + fk_array.join(",")});`;
    }
    else {
        sql = `CREATE TABLE IF NOT EXISTS ${quoteColumn(tableName)} (${columnDefinitions});`;
    }
    return sql;
}
exports.default = {
    generateInsertSQL,
    generateUpdateSQL,
    generateCreateTableSQL,
};
