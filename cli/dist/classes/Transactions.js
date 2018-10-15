"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const sqlite3 = require("sqlite3");
class Transactions {
    constructor(dataDir) {
        this.databasePath = path.join(dataDir, 'db.sqlite3');
        this.database = new sqlite3.Database(this.databasePath);
    }
    makeTransactionsTable() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            yield this.database.serialize(function () {
                return __awaiter(this, void 0, void 0, function* () {
                    this.run('CREATE TABLE lorem (info TEXT)');
                });
            });
            yield this.database.close();
            resolve(true);
        }));
    }
    insertTransaction() {
    }
    getAllTransactions() {
    }
}
exports.default = Transactions;
