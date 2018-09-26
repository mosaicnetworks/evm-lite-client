"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Web3Accounts = require("web3-eth-accounts");
class Account {
    constructor() {
        this.balance = 0;
        this.nonce = 0;
        this._account = new Web3Accounts().create();
    }
    get sign() {
        return this._account.sign;
    }
    get encrypt() {
        return this._account.encrypt;
    }
    get signTransaction() {
        return this._account.signTransaction;
    }
    get address() {
        return this._account.address;
    }
    get privateKey() {
        return this._account.privateKey;
    }
}
exports.default = Account;
