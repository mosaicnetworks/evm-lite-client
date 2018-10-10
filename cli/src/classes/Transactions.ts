import * as path from "path";

import DataDirectory from "./DataDirectory";

export default class Transactions {

    public database: string;

    constructor(dataDir: string) {
        this.database = path.join(dataDir, 'db.sqlite3');
        DataDirectory.createOrReadFile(this.database, '');
    }

}