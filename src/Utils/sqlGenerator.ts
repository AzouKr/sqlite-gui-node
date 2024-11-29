import type { DataItem } from "../types";
import databaseFunctions from "./databaseFunctions";
import { isEmpty, quoteColumn as q, quoteValue } from "./helpers";

async function generateInsertSQL(
  db: any,
  tableName: string,
  data: DataItem[]
): Promise<string> {
  // Extract field names and escape values (optional for TEXT and BLOB)
  const columns: string[] = [];
  const values: string[] = [];

  await Promise.all(
    data.map(async (item) => {
      const hasDefault = await databaseFunctions.checkColumnHasDefault(
        db,
        tableName,
        item.type.toUpperCase(),
        item.field
      );

      if (isEmpty(item.value) && hasDefault.bool) return;

      columns.push(q(item.field));
      values.push(quoteValue(item));
    })
  );

  // Form the SQL statement
  const sql = `INSERT INTO ${tableName} (${columns.join(
    ", "
  )}) VALUES (${values.join(", ")});`;

  return sql;
}

function generateUpdateSQL(
  tableName: string,
  data: DataItem[],
  id: number | string,
  id_label: string
): string {
  // Extract field names and values with proper handling
  const setClauses = data
    .map((item) => `${q(item.field)} = ${quoteValue(item)}`)
    .join(", ");
  // Form the SQL statement
  const sql = `UPDATE ${q(tableName)} SET ${setClauses} WHERE ${id_label} = ${
    typeof id === "string" ? `'${id}'` : id
  };`;

  return sql;
}

function generateCreateTableSQL(tableName: string, data: DataItem[]): string {
  // Map through data to generate column definitions
  const fk_array: string[] = [];
  const columnDefinitions = data
    .map((item) => {
      let columnType: string;
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

      let columnDefinition = `${q(item.name)} ${columnType}`;
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
    sql = `CREATE TABLE IF NOT EXISTS ${q(tableName)} (${columnDefinitions} ${
      "," + fk_array.join(",")
    });`;
  } else {
    sql = `CREATE TABLE IF NOT EXISTS ${q(tableName)} (${columnDefinitions});`;
  }

  return sql;
}

export default {
  generateInsertSQL,
  generateUpdateSQL,
  generateCreateTableSQL,
};
