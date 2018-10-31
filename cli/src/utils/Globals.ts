import * as path from "path";
import * as Chalk from "chalk";
import * as Vorpal from "vorpal";
import Session from "../classes/Session";


export interface BaseAccount {
    address: string,
    nonce: number,
    balance: any
}

export interface SentTx {
    from: string,
    to: string,
    value: number,
    gas: number,
    nonce: number,
    gasPrice: number,
    date: any,
    txHash: string
}

export interface TXReceipt {
    root: string,
    transactionHash: string,
    from: string,
    to?: string,
    gasUsed: number,
    cumulativeGasUsed: number,
    contractAddress: string,
    logs: [],
    logsBloom: string,
    status: number
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

export interface v3JSONKeyStore {
    version: number,
    id: string,
    address: string,
    crypto: KDFEncryption,
}

export type CommandFunction = (evmlc: Vorpal, session: Session) => Vorpal.Command;

export default class Globals {

    static evmlcDir: string = path.join(require('os').homedir(), '.evmlc');

    constructor() {
    }

    static success(message: any): void {
        console.log(Chalk.default.green(message));
    }

    static warning(message: any): void {
        console.log(Chalk.default.yellow(message));
    }

    static error(message: any): void {
        console.log(Chalk.default.red(message));
    }

    static info(message: any): void {
        console.log(Chalk.default.blue(message));
    }

    static isEquivalentObjects(objectA: any, objectB: any) {

        let aProps = Object.getOwnPropertyNames(objectA);
        let bProps = Object.getOwnPropertyNames(objectB);

        if (aProps.length !== bProps.length) {
            return false;
        }

        for (let i = 0; i < aProps.length; i++) {
            let propName = aProps[i];

            if (typeof objectA[propName] === 'object' && typeof objectB[propName] === 'object') {
                if (!Globals.isEquivalentObjects(objectA[propName], objectB[propName])) {
                    return false;
                }
            } else if (objectA[propName] !== objectB[propName]) {
                return false;
            }
        }

        return true;
    }

}
