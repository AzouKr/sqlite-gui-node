import databaseFunctions from "./databaseFunctions";

interface DataItem {
  field: string;
  name: string;
  type: string;
  value?: string | number | null; // Optional value based on type
  pk?: string; // Optional primary key constraint
  default?: string | number | null; // Optional default value
}

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
      if (!hasDefault.bool) {
        // doesn't have default value
        columns.push(item.field);
        if (
          item.type.toUpperCase() === "TEXT" ||
          item.type.toUpperCase() === "BLOB"
        ) {
          values.push(
            item.value !== ""
              ? `'${String(item.value).replace(/'/g, "''")}'`
              : "NULL" // Escape single quotes or use NULL
          );
        } else {
          values.push(String(item.value) !== "" ? String(item.value) : "NULL"); // Include NULL for empty values
        }
      }
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
  id: number
): string {
  // Extract field names and values with proper handling
  const setClauses = data
    .map((item) => {
      let value: string;
      if (
        item.value === null ||
        item.value === "" ||
        item.value === undefined
      ) {
        value = "NULL";
      } else if (item.type === "TEXT") {
        value = `'${String(item.value).replace(/'/g, "''")}'`; // Escape single quotes
      } else {
        value = item.value.toString(); // Ensure string representation for database
      }
      return `${item.field} = ${value}`;
    })
    .join(", ");

  // Form the SQL statement
  const sql = `UPDATE ${tableName} SET ${setClauses} WHERE id = ${id};`;

  return sql;
}

function generateCreateTableSQL(tableName: string, data: DataItem[]): string {
  // Map through data to generate column definitions
  const columnDefinitions = data
    .map((item) => {
      let columnType: string;
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

      let columnDefinition = `${item.name} ${columnType}`;
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
  const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefinitions});`;

  return sql;
}

export default {
  generateInsertSQL,
  generateUpdateSQL,
  generateCreateTableSQL,
};
