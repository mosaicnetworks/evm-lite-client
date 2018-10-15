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
        return new Promise<boolean>(async (resolve) => {
            await this.database.serialize(async function () {
                this.run('CREATE TABLE lorem (info TEXT)');
            });

            await this.database.close();
            resolve(true);
        });
    }

    insertTransaction() {
    }

    getAllTransactions() {
    }

}
