"use strict";
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
// import the SQLite DB that you use
const db = new sqlite3.Database("app.db");
// Import the package
const { SqliteGuiNode } = require("./");
SqliteGuiNode(db, 3001);
