import * as Web3 from 'web3'

interface Web3Account {
    address: string,
    privateKey: string,
    sign: (data: string) => any,
    encrypt: (password: string) => any,
    signTransaction: (tx: string) => any,
}


export default class Account {
    readonly web3: Web3;
    readonly account: Web3Account;

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