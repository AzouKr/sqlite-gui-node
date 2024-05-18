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
        console.log("Error while fetching tables");
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
        console.log("Error while fetching tables");
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
        console.log("Error while fetching table info");
        reject({ bool: false, error: error.message });
      } else {
        // console.log("Successfully fetched table info");
        const tableInfo = rows.map((row) => ({
          field: row.name,
          type: row.type,
        }));
        resolve({ bool: true, data: tableInfo });
      }
    });
  });
}

function insertTable(db, sqlStatement) {
  // console.log(sqlStatement);
  return new Promise(function (resolve, reject) {
    db.run(sqlStatement, function (error) {
      if (error) {
        console.log("Error while inserting");
        reject({ bool: false, error: error.message });
        return;
      } else {
        // console.log("Successfully inserted");
        resolve({ bool: true });
      }
    });
  });
}
function deleteFromTable(db, name, id) {
  // console.log(sqlStatement);
  return new Promise(function (resolve, reject) {
    db.run(`DELETE FROM ${name} WHERE id = ${id};`, function (error) {
      if (error) {
        console.log("Error while inserting");
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
};
