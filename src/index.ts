import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import path from "path";
import databaseFunctions from "./Utils/databaseFunctions";
import logger from "./Utils/logger";
import tableRoutes from "./routes/tables";
import type { Database } from "sqlite3";

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "../public")));
app.use(bodyParser.json());

app.use((req: Request, res: Response, next) => {
  res.locals.basePath = req.baseUrl;
  next();
});

// Routes
app.get("/query", (req, res) => {
  res.render("query", { title: "Query Page" });
});

app.get("/home", (req, res) => {
  res.render("index", { title: "Home Page" });
});

app.get("/createtable", (req, res) => {
  res.render("createTable", { title: "Create Table Page" });
});

app.get("/insert/:table", (req, res) => {
  const tableName = req.params.table;
  res.render("insert", { tableName });
});

app.get("/edit/:table/:label/:id", (req, res) => {
  const tableName = req.params.table;
  const id = req.params.id;
  res.render("edit", { tableName, id });
});

// SqliteGuiNode function to run the app
export async function SqliteGuiNode(db: Database, port = 8080) {
  await databaseFunctions.InitializeDB(db);
  app.use("/api/tables", tableRoutes(db));
  app.listen(port, () => {
    logger.info(
      `SQLite Web Admin Tool running at http://localhost:${port}/home`
    );
  });
}

export async function createSqliteGuiApp(db: Database) {
  await databaseFunctions.InitializeDB(db);
  app.use("/api/tables", tableRoutes(db));

  return app;
}

// SqliteGuiNode as middleware
export function SqliteGuiNodeMiddleware(app: any, db: Database) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      await databaseFunctions.InitializeDB(db);
      app.set("view engine", "ejs");
      app.set("views", path.join(__dirname, "../views"));

      app.use(bodyParser.urlencoded({ extended: false }));
      app.use(express.static(path.join(__dirname, "../public")));
      app.use(bodyParser.json());

      // Routes
      app.get("/query", (req: Request, res: Response) => {
        res.render("query", { title: "Query Page" });
      });

      app.get("/", (req: Request, res: Response) => {
        res.render("index", { title: "Home Page" });
      });

      app.get("/createtable", (req: Request, res: Response) => {
        res.render("createTable", { title: "Create Table Page" });
      });

      app.get("/insert/:table", (req: Request, res: Response) => {
        const tableName = req.params.table;
        res.render("insert", { tableName });
      });

      app.get("/edit/:table/:label/:id", (req: Request, res: Response) => {
        const tableName = req.params.table;
        const id = req.params.id;
        res.render("edit", { tableName, id });
      });
      app.use("/api/tables", tableRoutes(db)); // Add table routes
      app.get("/home", (req: Request, res: Response) => {
        res.render("index", { title: "Home Page" });
      });

      next(); // Proceed to the next middleware/route handler
    } catch (error) {
      // Handle any errors during DB initialization
      logger.error("Error initializing the database:", error);
      res.status(500).send("Error initializing the database.");
    }
  };
}
