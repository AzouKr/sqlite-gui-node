"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sqlite3_1 = require("sqlite3");
const index_1 = require("./index"); // Adjust the path accordingly
const app = (0, express_1.default)();
const PORT = 4000;
// Initialize the SQLite database with a file-based persistent database
const db = new sqlite3_1.Database("app.db", (err) => {
    if (err) {
        console.error("Error connecting to SQLite database:", err.message);
    }
    else {
        console.log("Connected to SQLite database 'app.db'");
    }
});
// Apply the SqliteGuiNodeMiddleware
// use the GUI
(0, index_1.SqliteGuiNode)(db).catch((err) => {
    console.error("Error starting the GUI:", err);
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
