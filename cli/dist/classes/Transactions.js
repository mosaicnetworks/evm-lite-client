"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const sqlite3 = require("sqlite3");
class Transactions {
    constructor(dataDir) {
        this.databasePath = path.join(dataDir, 'db.sqlite3');
        this.database = new sqlite3.Database('danu.sqlite3');
    }
    createTables() {
    }
    insertTransaction() {
    }
    getAllTransactions() {
    }
}
exports.default = Transactions;
