const { checkColumnHasDefault } = require("../Utils/displayTables");

async function generateInsertSQL(db, tableName, data) {
  // Extract field names
  const columns = [];
  const values = [];

  // Process each item in data asynchronously
  await Promise.all(
    data.map(async (item) => {
      const res = await checkColumnHasDefault(
        db,
        tableName,
        item.type.toUpperCase(),
        item.field
      );
      if (!res.bool) {
        columns.push(item.field);
        if (
          item.type.toUpperCase() === "TEXT" ||
          item.type.toUpperCase() === "BLOB"
        ) {
          if (item.value !== "") {
            values.push(`'${item.value.replace(/'/g, "''")}'`); // Escape single quotes
          }
        } else {
          if (item.value !== "") {
            values.push(item.value);
          }
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

function generateUpdateSQL(tableName, data, id) {
  // Extract field names and their corresponding values
  const setClauses = data
    .map((item) => {
      let value;
      if (item.value === null || item.value === "") {
        value = "NULL";
      } else if (item.type === "TEXT") {
        value = `'${item.value.replace(/'/g, "''")}'`; // Escape single quotes
      } else {
        value = item.value;
      }
      return `${item.field} = ${value}`;
    })
    .join(", ");

  // Form the SQL statement
  const sql = `UPDATE ${tableName} SET ${setClauses} WHERE id = ${id};`;

  return sql;
}

function generateCreateTableSQL(tableName, data) {
  // Map through the data to generate column definitions
  const columnDefinitions = data
    .map((item) => {
      let columnType;
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
        default:
          throw new Error(`Unknown type: ${item.type}`);
      }
      let columnDefinition = `${item.name} ${columnType}`;
      if (item.pk !== "") {
        columnDefinition += ` ${item.pk}`;
      }
      if (item.default !== null && item.default !== undefined) {
        columnDefinition += ` DEFAULT ${item.default}`;
      }
      return columnDefinition;
    })
    .join(", ");

  // Form the SQL statement
  const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefinitions});`;

  return sql;
}

module.exports = {
  generateInsertSQL,
  generateUpdateSQL,
  generateCreateTableSQL,
};
