const express = require("express");
const router = express.Router();
const {
  fetchAllTables,
  fetchTable,
  insertTable,
  fetchTableInfo,
  deleteFromTable,
  fetchRecord,
  checkColumnHasDefault,
  runQuery,
  runSelectQuery,
} = require("../Utils/displayTables");

const {
  generateInsertSQL,
  generateUpdateSQL,
  generateCreateTableSQL,
} = require("../Utils/sqlGenerator");

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
      const sql = await generateInsertSQL(db, tablename, dataArray);
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

  router.post("/query", async (req, res) => {
    try {
      const { sqlQuery } = req.body;
      const lowersqlQuery = sqlQuery.toLowerCase();
      if (lowersqlQuery.slice(0, 6) === "select") {
        runSelectQuery(db, lowersqlQuery)
          .then((response) => {
            if (lowersqlQuery.slice(0, 15) === "select count(*)") {
              res.status(200).json({
                type: "string",
                data: "Count result is " + response.data[0]["count(*)"],
              });
            } else {
              res.status(200).json({ type: "table", data: response.data });
            }
          })
          .catch((err) => {
            res.status(500).json(err);
          });
      } else {
        runQuery(db, sqlQuery)
          .then((response) => {
            if (lowersqlQuery.slice(0, 6) === "update") {
              res
                .status(200)
                .json({ type: "string", data: "Updated Successfully" });
            }
            if (lowersqlQuery.slice(0, 6) === "insert") {
              res
                .status(200)
                .json({ type: "string", data: "Inserted Successfully" });
            }
            if (lowersqlQuery.slice(0, 6) === "delete") {
              res
                .status(200)
                .json({ type: "string", data: "Deleted Successfully" });
            }
          })
          .catch((err) => {
            res.status(500).json(err);
          });
      }
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

  return router;
};
