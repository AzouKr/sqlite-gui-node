const express = require("express");
const router = express.Router();
const {
  fetchAllTables,
  fetchTable,
  insertTable,
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

  router.post("/insert", async (req, res) => {
    try {
      // Extract table name and data
      const { tablename, datatable, fields } = req.body;
      // Extract column names and values from the datatable
      const columns = Object.keys(datatable).join(", ");
      const values = Object.values(fields)
        .map((value) => (typeof value === "string" ? `'${value}'` : value))
        .join(", ");

      // Construct the SQL statement
      const sqlStatement = `INSERT INTO ${tablename} (${columns}) VALUES (${values})`;
      insertTable(sqlStatement)
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
