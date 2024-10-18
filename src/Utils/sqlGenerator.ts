import databaseFunctions from "./databaseFunctions";

interface DataItem {
  field: string;
  name: string;
  type: string;
  value?: string | number | null; // Optional value based on type
  pk?: string; // Optional primary key constraint
  fk: string;
  default?: string | number | null; // Optional default value
}

// Consider null, undefined and "" as empty, but not 0
const isEmpty = (value: string | number | null | undefined) =>
  !value && value !== 0;

const quoteValue = (item: DataItem): string => {
  const shouldQuote =
    item.type === "text" ||
    item.type === "blob" ||
    item.type.match(/^varchar/i);

  if (isEmpty(item.value)) return "NULL";

  return shouldQuote
    ? `'${String(item.value).replace(/'/g, "''")}'`
    : String(item.value);
};

const quoteColumn = (columnOrTable: string) => "`" + columnOrTable + "`";

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

      columns.push(quoteColumn(item.field));
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
  id: number,
  id_label: string
): string {
  // Extract field names and values with proper handling
  const setClauses = data
    .map((item) => `${quoteColumn(item.field)} = ${quoteValue(item)}`)
    .join(", ");

  // Form the SQL statement
  const sql = `UPDATE ${quoteColumn(
    tableName
  )} SET ${setClauses} WHERE ${id_label} = ${id};`;

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
    sql = `CREATE TABLE IF NOT EXISTS ${quoteColumn(
      tableName
    )} (${columnDefinitions} ${"," + fk_array.join(",")});`;
  } else {
    sql = `CREATE TABLE IF NOT EXISTS ${quoteColumn(
      tableName
    )} (${columnDefinitions});`;
  }

  return sql;
}

export default {
  generateInsertSQL,
  generateUpdateSQL,
  generateCreateTableSQL,
};
