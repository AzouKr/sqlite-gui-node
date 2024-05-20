const logger = require("./logger");

function fetchAllTables(db) {
  return new Promise(function (resolve, reject) {
    db.all(
      "SELECT name FROM sqlite_master WHERE type='table'",
      function (error, rows) {
        if (error) {
          logger.error("Error while fetching tables");
          logger.error(error.message);
          reject({ bool: false, error: error.message });
          return;
        } else {
          // console.log("Successfully fetched tables");
          resolve({ bool: true, data: rows });
        }
      }
    );
  });
}

function fetchTable(db, table) {
  return new Promise(function (resolve, reject) {
    db.all(`SELECT * FROM ${table}`, function (error, rows) {
      if (error) {
        logger.error("Error while fetching table");
        logger.error(error.message);
        reject({ bool: false, error: error.message });
        return;
      } else {
        // console.log("Successfully fetched tables");
        resolve({ bool: true, data: rows });
      }
    });
  });
}
function fetchRecord(db, table, id) {
  return new Promise(function (resolve, reject) {
    db.all(`SELECT * FROM ${table} WHERE id = ${id}`, function (error, rows) {
      if (error) {
        logger.error("Error while fetching record");
        logger.error(error.message);
        reject({ bool: false, error: error.message });
        return;
      } else {
        // console.log("Successfully fetched tables");
        resolve({ bool: true, data: rows });
      }
    });
  });
}

function fetchTableInfo(db, table) {
  return new Promise(function (resolve, reject) {
    db.all(`PRAGMA table_info(${table})`, function (error, rows) {
      if (error) {
        logger.error("Error while fetching table info");
        logger.error(error.message);
        reject({ bool: false, error: error.message });
      } else {
        // Filter out the auto-increment column
        const filteredColumns = rows.filter(
          (row) => !(row.pk > 0 && row.type.toUpperCase() === "INTEGER")
        );

        // Map the remaining columns to an array of column objects with name and type
        const tableInfo = filteredColumns.map((row) => ({
          field: row.name,
          type: row.type,
        }));

        if (tableInfo.length === 0) {
          reject({
            bool: false,
            error: "No columns to select (all columns are auto-increment).",
          });
        } else {
          resolve({ bool: true, data: tableInfo });
        }
      }
    });
  });
}

function insertTable(db, sqlStatement) {
  return new Promise(function (resolve, reject) {
    db.run(sqlStatement, function (error) {
      if (error) {
        logger.error("SQL Statement : " + sqlStatement);
        logger.error(error.message);
        reject({ bool: false, error: error.message });
        return;
      } else {
        // console.log("Successfully inserted");
        resolve({ bool: true });
      }
    });
  });
}
function runQuery(db, sqlStatement) {
  return new Promise(function (resolve, reject) {
    db.run(sqlStatement, function (error) {
      if (error) {
        logger.error("SQL Statement : " + sqlStatement);
        logger.error(error.message);
        reject({ bool: false, error: error.message });
        return;
      } else {
        // console.log("Successfully inserted");
        resolve({ bool: true });
      }
    });
  });
}

function runSelectQuery(db, sqlStatement) {
  return new Promise(function (resolve, reject) {
    db.all(sqlStatement, function (error, rows) {
      if (error) {
        logger.error("SQL Statement : " + sqlStatement);
        logger.error(error.message);
        reject({ bool: false, error: error.message });
        return;
      } else {
        // console.log(rows);
        // logger.info("Successfully fetching");
        resolve({ bool: true, data: rows });
      }
    });
  });
}

function checkColumnHasDefault(db, tableName, columnType, columnName) {
  return new Promise(function (resolve, reject) {
    try {
      // Construct the SQL query to check if the column has a default value
      const sql = `
              SELECT sql
              FROM sqlite_master
              WHERE type = 'table' AND name = '${tableName}'
          `;

      // Execute the SQL query
      db.get(sql, [], (err, row) => {
        if (err) {
          reject({
            bool: false,
            message: "Error while executing query",
            error: err.message,
          });
          return;
        }

        if (!row) {
          resolve({ bool: false, message: "Table not found" });
          return;
        }
        // Check if the SQL definition contains the column name and the word "DEFAULT"
        const hasDefault = row.sql.includes(
          `${columnName} ${columnType} DEFAULT`
        );

        // Return the result
        resolve({ bool: hasDefault, message: "" });
      });
    } catch (error) {
      reject({
        bool: false,
        message: "Error while executing query",
        error: error.message,
      });
    }
  });
}

function deleteFromTable(db, name, id) {
  // console.log(sqlStatement);
  return new Promise(function (resolve, reject) {
    db.run(`DELETE FROM ${name} WHERE id = ${id};`, function (error) {
      if (error) {
        logger.error("Error while deleting");
        logger.error(error.message);
        reject({ bool: false, error: error.message });
        return;
      } else {
        // console.log("Successfully inserted");
        resolve({ bool: true });
      }
    });
  });
}

module.exports = {
  fetchAllTables,
  fetchTable,
  insertTable,
  fetchTableInfo,
  deleteFromTable,
  fetchRecord,
  checkColumnHasDefault,
  runQuery,
  runSelectQuery,
};
