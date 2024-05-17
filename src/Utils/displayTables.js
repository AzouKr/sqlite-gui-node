function fetchAllTables(db) {
  return new Promise(function (resolve, reject) {
    db.all(
      "SELECT name FROM sqlite_master WHERE type='table'",
      function (error, rows) {
        if (error) {
          console.log("Error while fetching tables");
          reject({ bool: false, error: error.message });
          return;
        } else {
          console.log("Successfully fetched tables");
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
        console.log("Error while fetching tables");
        reject({ bool: false, error: error.message });
        return;
      } else {
        console.log("Successfully fetched tables");
        resolve({ bool: true, data: rows });
      }
    });
  });
}
function insertTable(sqlStatement) {
  return new Promise(function (resolve, reject) {
    db.all(
      "INSERT INTO example1 (id, name) VALUES (10000, 'azou')",
      function (error, rows) {
        if (error) {
          console.log("Error while inserting");
          reject({ bool: false, error: error.message });
          return;
        } else {
          console.log("Successfully inserted");
          resolve({ bool: true, data: rows });
        }
      }
    );
  });
}

module.exports = {
  fetchAllTables,
  fetchTable,
  insertTable,
};
