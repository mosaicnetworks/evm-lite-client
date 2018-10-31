"use strict";
exports.__esModule = true;
var JSONBig = require("json-bigint");
var fs = require("fs");
var Transactions_1 = require("./Transactions");
var DataDirectory_1 = require("./DataDirectory");
var Database = /** @class */ (function () {
    function Database(path) {
        this.path = path;
        this._data = JSONBig.parse(DataDirectory_1["default"].createOrReadFile(path, JSONBig.stringify(Database.initial())));
        this.transactions = new Transactions_1["default"](this.path, this._data.transactions);
    }
    Database.initial = function () {
        return {
            transactions: []
        };
    };
    Database.prototype.save = function () {
        this._data.transactions = this.transactions.all();
        fs.writeFileSync(this.path, JSONBig.stringify(this._data));
    };
    return Database;
}());
exports["default"] = Database;
