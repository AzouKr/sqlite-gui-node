const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

// Routes
app.get("", (req, res) => {
  res.render("index", { title: "Home Page" });
});
const tableRoutes = require("./src/routes/tables");

async function main(db) {
  app.use("/api/tables", tableRoutes(db));
  const port = process.env.port || 8080;
  app.listen(port, () => {
    console.log(`SQLite Web Admin Tool running at http://localhost:${port}`);
  });
}

module.exports = main;
