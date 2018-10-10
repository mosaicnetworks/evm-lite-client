"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const DataDirectory_1 = require("./DataDirectory");
class Transactions {
    constructor(dataDir) {
        this.database = path.join(dataDir, 'db.sqlite3');
        DataDirectory_1.default.createOrReadFile(this.database, '');
    }
}
exports.default = Transactions;
