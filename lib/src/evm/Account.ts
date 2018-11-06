/**
 * @file Account.js
 * @author Mosaic Networks <https://github.com/mosaicnetworks>
 * @date 2018
 */

import * as Web3Accounts from 'web3-eth-accounts';
import {BaseAccount} from "./utils/Interfaces";


interface Web3Account {
    address: string,
    privateKey: string,
    sign: (data: string) => any,
    encrypt: (password: string) => v3JSONKeyStore,
    signTransaction: (tx: string) => any,
}

interface KDFEncryption {
    ciphertext: string,
    ciperparams: {
        iv: string
    }
    cipher: string,
    kdf: string,
    kdfparams: {
        dklen: number,
        salt: string,
        n: number,
        r: number,
        p: number
    }
    mac: string
}

interface v3JSONKeyStore {
    version: number,
    id: string,
    address: string,
    crypto: KDFEncryption,
}


export default class Account {

    balance: number = 0;
    nonce: number = 0;
    private _account: Web3Account;


    constructor(create: boolean = true, aJSON: Web3Account = undefined) {
        if (create)
            this._account = new Web3Accounts().create();
        else {
            if (aJSON) {
                this._account = aJSON;
            } else {
                throw new Error('Account JSON needs to be passed to construct class');
            }
        }
    }

    get sign(): (data: string) => any {
        return this._account.sign
    }

    signTransaction(tx: string): any {
        return this._account.signTransaction(tx);
    }

    get address(): string {
        return this._account.address
    }

    get privateKey(): string {
        return this._account.privateKey
    }

    static create(): Account {
        return new Account(true)
    }

    static decrypt(v3JSONKeyStore: v3JSONKeyStore, password: string) {
        let decryptedAccount = new Web3Accounts().decrypt(v3JSONKeyStore, password);
        return new Account(false, decryptedAccount);
    }

    encrypt(password: string): v3JSONKeyStore {
        return this._account.encrypt(password);
    }

    toBaseAccount(): BaseAccount {
        return {
            address: this.address,
            balance: this.balance,
            nonce: this.nonce
        }
    }

}