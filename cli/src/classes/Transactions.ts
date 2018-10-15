import * as path from "path";
import * as sqlite3 from 'sqlite3';


export default class Transactions {

    public database: sqlite3.Database;
    public databasePath: string;

    constructor(dataDir: string) {
        this.databasePath = path.join(dataDir, 'db.sqlite3');
        this.database = new sqlite3.Database(this.databasePath);
    }

    makeTransactionsTable(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            this.database.serialize(function () {
                this.run('CREATE TABLE `transactions` (`id` INT(255) NOT NULL AUTO_INCREMENT, `from` VARCHAR(255), to` VARCHAR(255), `value` INT(255), `gas` INT(255), `gasprice` VARCHAR(255), `txhash` VARCHAR(255), `date` DATE(255), PRIMARY KEY (`id`));');
                resolve();
            });
        }).then(() => this.database.close());
    }

    insertTransaction() {
    }

    getAllTransactions() {
    }

}
