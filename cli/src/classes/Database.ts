import * as JSONBig from 'json-bigint';
import * as fs from "fs";

import {SentTx} from "../utils/Globals";

import Transactions from "./Transactions";
import DataDirectory from "./DataDirectory";


interface Schema {
    transactions: SentTx[],
}

export default class Database {

    public transactions: Transactions;
    readonly _data: Schema;

    constructor(readonly path: string) {
        this._data = JSONBig.parse(DataDirectory.createOrReadFile(path, JSONBig.stringify(Database.initial())));
        this.transactions = new Transactions(this.path, this._data.transactions);
    }

    static initial() {
        return {
            transactions: [],
        }
    }

    save() {
        this._data.transactions = this.transactions.all();
        fs.writeFileSync(this.path, JSONBig.stringify(this._data));
    }
}