import * as Web3Accounts from 'web3-eth-accounts';


interface Web3Account {
    address: string,
    privateKey: string,
    sign: (data: string) => any,
    encrypt: (password: string) => any,
    signTransaction: (tx: string) => any,
}


export default class Account {

    balance: number = 0;
    nonce: number = 0;
    private _account: Web3Account;


    constructor() {
        this._account = new Web3Accounts().create();
    }

    get sign() {
        return this._account.sign
    }

    get encrypt() {
        return this._account.encrypt
    }

    get signTransaction() {
        return this._account.signTransaction
    }

    get address() {
        return this._account.address
    }

    get privateKey() {
        return this._account.privateKey
    }

}