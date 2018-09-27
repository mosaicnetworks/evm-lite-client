import * as Web3Accounts from 'web3-eth-accounts';


interface Web3Account {
    address: string,
    privateKey: string,
    sign: (data: string) => any,
    encrypt: (password: string) => any,
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

    static create() {
        return new Account(true)
    }

    static decrypt(v3JSONKeyStore: v3JSONKeyStore, password: string) {
        let decryptedAccount = new Web3Accounts().decrypt(v3JSONKeyStore, password);
        return new Account(false, decryptedAccount);
    }

}