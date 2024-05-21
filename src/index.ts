import express from "express";
import bodyParser from "body-parser";
import path from "path";
import databaseFunctions from "./Utils/databaseFunctions";
import logger from "./Utils/logger";
import tableRoutes from "./routes/tables";
import * as sqlite3 from "sqlite3"; // Assuming you're using sqlite3

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "../public")));
app.use(bodyParser.json());

// Routes
app.get("/query", (req, res) => {
  res.render("query", { title: "Query Page" });
});

app.get("/", (req, res) => {
  res.render("index", { title: "Home Page" });
});

app.get("/createtable", (req, res) => {
  res.render("createTable", { title: "Create Table Page" });
});

app.get("/insert/:table", (req, res) => {
  const tableName = req.params.table;
  res.render("insert", { tableName });
});

app.get("/edit/:table/:id", (req, res) => {
  const tableName = req.params.table;
  const id = req.params.id;
  res.render("edit", { tableName, id });
});

async function SqliteGuiNode(db: sqlite3.Database, port = 8080) {
  await databaseFunctions.InitializeDB(db);
  app.use("/api/tables", tableRoutes(db));
  app.listen(port, () => {
    logger.info(`SQLite Web Admin Tool running at http://localhost:${port}`);
  });
}

module.exports = SqliteGuiNode;
