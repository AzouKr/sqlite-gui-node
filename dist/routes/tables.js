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
const databaseFunctions_1 = __importDefault(require("../Utils/databaseFunctions"));
const sqlGenerator_1 = __importDefault(require("../Utils/sqlGenerator"));
const helpers_1 = require("../Utils/helpers");
const router = express_1.default.Router();
function tableRoutes(db) {
    router.get("/", (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield databaseFunctions_1.default.exportDatabaseToSQL(db);
            const tables = yield databaseFunctions_1.default.fetchAllTables(db);
            res.status(200).json(tables);
        }
        catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    }));
    router.get("/local/query", (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield databaseFunctions_1.default.InitializeDB(db);
            const queries = yield databaseFunctions_1.default.fetchQueries(db);
            res.status(200).json(queries);
        }
        catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    }));
    router.post("/local/query", (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield databaseFunctions_1.default.InitializeDB(db);
            const { name, sqlStatement } = req.body;
            const response = yield databaseFunctions_1.default.insertQuery(db, name, sqlStatement);
            res.status(200).json(response);
        }
        catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    }));
    router.get("/:name", (req, res) => __awaiter(this, void 0, void 0, function* () {
        const { name } = req.params;
        const { page, perPage } = req.query;
        try {
            const response = yield databaseFunctions_1.default.fetchTable(db, name, { page: Number(page), perPage: Number(perPage) });
            res.status(200).json(response);
        }
        catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    }));
    router.get("/infos/:name", (req, res) => __awaiter(this, void 0, void 0, function* () {
        const { name } = req.params;
        try {
            const response = yield databaseFunctions_1.default.fetchTableInfo(db, name);
            const fk = yield databaseFunctions_1.default.fetchTableForeignKeys(db, name);
            if (fk.bool && fk.data !== undefined) {
                fk.data.forEach((element) => {
                    databaseFunctions_1.default
                        .fetchFK(db, element.table, element.to)
                        .then((fk_response) => {
                        if (response.data !== undefined) {
                            response.data.forEach((item) => {
                                if (item.field === element.from) {
                                    item.fk = fk_response.data.map((obj) => obj[element.to]);
                                }
                            });
                        }
                    });
                });
            }
            res.status(200).json(response);
        }
        catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    }));
    router.get("/all/infos/:name", (req, res) => __awaiter(this, void 0, void 0, function* () {
        const { name } = req.params;
        try {
            const response = yield databaseFunctions_1.default.fetchAllTableInfo(db, name);
            res.status(200).json(response);
        }
        catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    }));
    router.post("/insert", (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { tablename, dataArray } = req.body;
            const sql = yield sqlGenerator_1.default.generateInsertSQL(db, tablename, dataArray);
            const response = yield databaseFunctions_1.default.runQuery(db, sql);
            res.status(200).json(response);
        }
        catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    }));
    router.post("/generate/insert", (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { tablename, dataArray } = req.body;
            const sql = yield sqlGenerator_1.default.generateInsertSQL(db, tablename, dataArray);
            res.status(200).json(sql);
        }
        catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    }));
    router.post("/query", (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { sqlQuery } = req.body;
            const lowersqlQuery = sqlQuery.toLowerCase();
            if (lowersqlQuery.startsWith("select")) {
                const response = yield databaseFunctions_1.default.runSelectQuery(db, sqlQuery);
                if (lowersqlQuery.startsWith("select count(*)")) {
                    if (response.data !== undefined) {
                        res.status(200).json({
                            type: "string",
                            data: "Count result is " + response.data[0]["count(*)"],
                        });
                    }
                    else {
                        res.status(500).json({
                            type: "string",
                            data: "Database error",
                        });
                    }
                }
                else {
                    res.status(200).json({ type: "table", data: response.data });
                }
            }
            else {
                yield databaseFunctions_1.default.runQuery(db, sqlQuery);
                let message = "";
                if (lowersqlQuery.startsWith("update"))
                    message = "Updated Successfully";
                if (lowersqlQuery.startsWith("insert"))
                    message = "Inserted Successfully";
                if (lowersqlQuery.startsWith("delete"))
                    message = "Deleted Successfully";
                if (lowersqlQuery.startsWith("create"))
                    message = "Created Successfully";
                res.status(200).json({ type: "string", data: message });
            }
        }
        catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    }));
    router.post("/create", (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { tableName, data } = req.body;
            const sql = sqlGenerator_1.default.generateCreateTableSQL(tableName, data);
            const response = yield databaseFunctions_1.default.runQuery(db, sql);
            res.status(200).json(response);
        }
        catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    }));
    router.post("/generate/create", (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { tableName, data } = req.body;
            const sql = sqlGenerator_1.default.generateCreateTableSQL(tableName, data);
            res.status(200).json(sql);
        }
        catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    }));
    router.post("/update", (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { tablename, dataArray, userId, id_label } = req.body;
            const sql = sqlGenerator_1.default.generateUpdateSQL(tablename, dataArray, userId, id_label);
            const response = yield databaseFunctions_1.default.runQuery(db, sql);
            res.status(200).json(response);
        }
        catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    }));
    router.post("/generate/update", (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { tablename, dataArray, userId, id_label } = req.body;
            const sql = sqlGenerator_1.default.generateUpdateSQL(tablename, dataArray, userId, id_label);
            res.status(200).json(sql);
        }
        catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    }));
    router.get("/getrecord/:tablename/:label/:id", (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { tablename, label, id } = req.params;
            const response = yield databaseFunctions_1.default.fetchRecord(db, tablename, label, id);
            res.status(200).json(response);
        }
        catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    }));
    router.post("/delete", (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { tablename, id } = req.body;
            const response = yield databaseFunctions_1.default.deleteFromTable(db, tablename, id);
            res.status(200).json(response);
        }
        catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    }));
    router.post("/table/delete", (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { tablename } = req.body;
            const sql = `DROP TABLE ${(0, helpers_1.quoteColumn)(tablename)};`;
            const response = yield databaseFunctions_1.default.runQuery(db, sql);
            res.status(200).json(response);
        }
        catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    }));
    return router;
}
exports.default = tableRoutes;
