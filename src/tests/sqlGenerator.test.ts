import sqlGenerator from "../Utils/sqlGenerator";

interface UpdateData {
  field: string;
  name: string;
  value: string | number;
  fk: string;
  type: string;
}

interface CreateTableData {
  field: string;
  name: string;
  type: string;
  pk: string;
  fk: string;
  default: string | number | null;
}

describe("generateUpdateSQL", () => {
  test("should generate correct SQL for updating a table", () => {
    const tableName = "users";
    const data: UpdateData[] = [
      {
        name: "name",
        field: "name",
        value: "John Doe",
        type: "TEXT",
        fk: "id",
      },
      { name: "name", field: "age", value: 30, type: "INTEGER", fk: "id" },
    ];
    const id = 1;
    const id_label = "id";

    const expectedSQL =
      "UPDATE users SET name = 'John Doe', age = 30 WHERE id = 1;";
    const resultSQL = sqlGenerator.generateUpdateSQL(
      tableName,
      data,
      id,
      id_label
    );

    expect(resultSQL).toBe(expectedSQL);
  });
});

describe("generateCreateTableSQL", () => {
  test("should generate correct SQL for creating a table", () => {
    const tableName = "users";
    const data: CreateTableData[] = [
      {
        field: "name",
        name: "id",
        type: "INTEGER",
        pk: "PRIMARY KEY",
        default: null,
        fk: "No",
      },
      {
        field: "name",
        name: "name",
        type: "TEXT",
        pk: "",
        default: null,
        fk: "No",
      },
      {
        field: "name",
        name: "age",
        type: "INTEGER",
        pk: "",
        default: 0,
        fk: "No",
      },
    ];

    const expectedSQL =
      "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER DEFAULT 0);";
    const resultSQL = sqlGenerator.generateCreateTableSQL(tableName, data);

    expect(resultSQL).toBe(expectedSQL);
  });

  test("should throw an error for unknown column type", () => {
    const tableName = "users";
    const data: CreateTableData[] = [
      {
        field: "name",
        name: "id",
        type: "UNKNOWN",
        pk: "",
        default: null,
        fk: "id",
      },
    ];

    expect(() => {
      sqlGenerator.generateCreateTableSQL(tableName, data);
    }).toThrowError("Unknown type: UNKNOWN");
  });
});
