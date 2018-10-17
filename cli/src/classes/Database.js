"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JSONBig = require("json-bigint");
const fs = require("fs");
const Transactions_1 = require("./Transactions");
const DataDirectory_1 = require("./DataDirectory");
class Database {
    constructor(path) {
        this.path = path;
        this._data = JSONBig.parse(DataDirectory_1.default.createOrReadFile(path, JSONBig.stringify(Database.initial())));
        this.transactions = new Transactions_1.default(this.path, this._data.transactions);
    }
    static initial() {
        return {
            transactions: [],
        };
    }
    save() {
        this._data.transactions = this.transactions.all();
        fs.writeFileSync(this.path, JSONBig.stringify(this._data));
    }
}
exports.default = Database;
