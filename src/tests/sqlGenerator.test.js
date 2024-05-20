const {
  generateUpdateSQL,
  generateCreateTableSQL,
} = require("../Utils/sqlGenerator");

describe("generateUpdateSQL", () => {
  test("should generate correct SQL for updating a table", () => {
    const tableName = "users";
    const data = [
      { field: "name", value: "John Doe", type: "TEXT" },
      { field: "age", value: 30, type: "INTEGER" },
    ];
    const id = 1;

    const expectedSQL =
      "UPDATE users SET name = 'John Doe', age = 30 WHERE id = 1;";
    const resultSQL = generateUpdateSQL(tableName, data, id);

    expect(resultSQL).toBe(expectedSQL);
  });
});

describe("generateCreateTableSQL", () => {
  test("should generate correct SQL for creating a table", () => {
    const tableName = "users";
    const data = [
      { name: "id", type: "INTEGER", pk: "PRIMARY KEY", default: null },
      { name: "name", type: "TEXT", pk: "", default: null },
      { name: "age", type: "INTEGER", pk: "", default: 0 },
    ];

    const expectedSQL =
      "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER DEFAULT 0);";
    const resultSQL = generateCreateTableSQL(tableName, data);

    expect(resultSQL).toBe(expectedSQL);
  });

  test("should throw an error for unknown column type", () => {
    const tableName = "users";
    const data = [{ name: "id", type: "UNKNOWN", pk: "", default: null }];

    expect(() => {
      generateCreateTableSQL(tableName, data);
    }).toThrowError("Unknown type: UNKNOWN");
  });
});
