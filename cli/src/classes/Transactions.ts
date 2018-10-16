import {SentTx} from "../utils/Globals";


export default class Transactions {

    constructor(private dbPath: string, private _transactions: SentTx[]) {
        this.sort();
    }

    all(): SentTx[] {
        return this._transactions;
    }

    add(tx: any): void {
        delete tx.chainId;
        delete tx.data;

        tx.value = parseInt(tx.value, 16);
        tx.gas = parseInt(tx.gas, 16);
        tx.gasPrice = parseInt(tx.gasPrice, 16);
        tx.nonce = parseInt(tx.nonce, 16);
        tx.date = new Date();

        this._transactions.push(tx);
        this.sort();
    }

    sort() {
        this._transactions.sort(function (a, b) {
            // @ts-ignore
            return new Date(b.date) - new Date(a.date);
        });
    }

}
