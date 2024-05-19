const express = require("express");
const router = express.Router();
const {
  fetchAllTables,
  fetchTable,
  insertTable,
  fetchTableInfo,
  deleteFromTable,
  fetchRecord,
} = require("../Utils/displayTables");

module.exports = function (db) {
  router.get("/", async (req, res) => {
    try {
      fetchAllTables(db).then((tables) => {
        res.status(200).json(tables); // Changed variable name to avoid conflict
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.get("/:name", async (req, res) => {
    const { name } = req.params;
    try {
      fetchTable(db, name)
        .then((response) => {
          res.status(200).json(response); // Changed variable name to avoid conflict
        })
        .catch((err) => {
          res.status(500).json(err);
        });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.get("/infos/:name", async (req, res) => {
    const { name } = req.params;
    try {
      fetchTableInfo(db, name)
        .then((response) => {
          res.status(200).json(response); // Changed variable name to avoid conflict
        })
        .catch((err) => {
          res.status(500).json(err);
        });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.post("/insert", async (req, res) => {
    try {
      // // Extract table name and data
      const { tablename, dataArray } = req.body;
      const sql = generateInsertSQL(tablename, dataArray);
      insertTable(db, sql)
        .then((response) => {
          res.status(200).json(response); // Changed variable name to avoid conflict
        })
        .catch((err) => {
          res.status(500).json(err);
        });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.post("/create", async (req, res) => {
    try {
      // // Extract table name and data
      const { tableName, data } = req.body;
      const sql = generateCreateTableSQL(tableName, data);
      insertTable(db, sql)
        .then((response) => {
          res.status(200).json(response); // Changed variable name to avoid conflict
        })
        .catch((err) => {
          res.status(500).json(err);
        });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.post("/update", async (req, res) => {
    try {
      // // Extract table name and data
      const { tablename, dataArray, userId } = req.body;
      const sql = generateUpdateSQL(tablename, dataArray, userId);
      console.log(sql);
      insertTable(db, sql)
        .then((response) => {
          res.status(200).json(response); // Changed variable name to avoid conflict
        })
        .catch((err) => {
          res.status(500).json(err);
        });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  router.get("/getrecord/:tablename/:id", async (req, res) => {
    try {
      // // Extract table name and data
      const { tablename, id } = req.params;
      fetchRecord(db, tablename, id)
        .then((response) => {
          res.status(200).json(response); // Changed variable name to avoid conflict
        })
        .catch((err) => {
          res.status(500).json(err);
        });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  router.post("/delete", async (req, res) => {
    try {
      // // Extract table name and data
      const { tablename, id } = req.body;
      deleteFromTable(db, tablename, id)
        .then((response) => {
          res.status(200).json(response); // Changed variable name to avoid conflict
        })
        .catch((err) => {
          res.status(500).json(err);
        });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.post("/table/delete", async (req, res) => {
    try {
      // // Extract table name and data
      const { tablename } = req.body;
      const sql = `DROP TABLE ${tablename};`;
      insertTable(db, sql)
        .then((response) => {
          res.status(200).json(response); // Changed variable name to avoid conflict
        })
        .catch((err) => {
          res.status(500).json(err);
        });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  function generateInsertSQL(tableName, data) {
    // Extract field names
    const columns = [];
    const values = [];

    data.forEach((item) => {
      if (
        item.value !== null &&
        item.value !== undefined &&
        item.value !== ""
      ) {
        columns.push(item.field);
        if (
          item.type.toUpperCase() === "TEXT" ||
          item.type.toUpperCase() === "BLOB"
        ) {
          values.push(`'${item.value.replace(/'/g, "''")}'`); // Escape single quotes
        } else {
          values.push(item.value);
        }
      }
    });

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

  return router;
};
