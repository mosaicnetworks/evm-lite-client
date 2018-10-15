"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const sqlite3 = require("sqlite3");
class Transactions {
    constructor(dataDir) {
        this.databasePath = path.join(dataDir, 'db.sqlite3');
        this.database = new sqlite3.Database(this.databasePath);
    }
    makeTransactionsTable() {
        return new Promise((resolve) => {
            this.database.serialize(function () {
                this.run('CREATE TABLE `transactions` (`id` INT(255) NOT NULL AUTO_INCREMENT, `from` VARCHAR(255),' +
                    ' to` VARCHAR(255), `value` INT(255), `gas` INT(255), `gasprice` VARCHAR(255), `txhash` VARCHAR(255), `date` DATE(255), PRIMARY KEY (`id`) ENGINE=InnoDB;);');
                resolve(true);
            });
        }).then(() => this.database.close());
    }
    insertTransaction() {
    }
    getAllTransactions() {
    }
}
exports.default = Transactions;
