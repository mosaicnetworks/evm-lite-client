"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
const Web3 = require("web3");

class Account {
    constructor() {
        this.web3 = new Web3();
        this.account = this.web3.eth.accounts.create();
    }

    get address() {
        return this.account.address;
    }

    get privateKey() {
        return this.account.privateKey;
    }

    get sign() {
        return this.account.sign;
    }

    get encrypt() {
        return this.account.encrypt;
    }

    get signTransaction() {
        return this.account.signTransaction;
    }

    get() {
        return this.account;
    }
}

exports.default = Account;
