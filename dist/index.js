"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
const databaseFunctions_1 = __importDefault(require("./Utils/databaseFunctions"));
const logger_1 = __importDefault(require("./Utils/logger"));
const tables_1 = __importDefault(require("./routes/tables"));
const app = (0, express_1.default)();
app.set("view engine", "ejs");
app.set("views", path_1.default.join(__dirname, "../views"));
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(express_1.default.static(path_1.default.join(__dirname, "../public")));
app.use(body_parser_1.default.json());
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
app.get("/edit/:table/:label/:id", (req, res) => {
    const tableName = req.params.table;
    const id = req.params.id;
    res.render("edit", { tableName, id });
});
function SqliteGuiNode(db_1) {
    return __awaiter(this, arguments, void 0, function* (db, port = 8080) {
        yield databaseFunctions_1.default.InitializeDB(db);
        app.use("/api/tables", (0, tables_1.default)(db));
        app.listen(port, () => {
            logger_1.default.info(`SQLite Web Admin Tool running at http://localhost:${port}`);
        });
    });
}
module.exports = SqliteGuiNode;
