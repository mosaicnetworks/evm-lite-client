import * as Chalk from "chalk";
import * as path from "path";
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

export interface V3JSONKeyStore {
    version: number,
    id: string,
    address: string,
    crypto: KDFEncryption,
}

export type CommandFunction = (evmlc: Vorpal, session: Session) => Vorpal.Command;

export default class Globals {

    public static evmlcDir: string = path.join(require('os').homedir(), '.evmlc');

    public static success(message: any): void {
        console.log(Chalk.default.green(message));
    }

    public static warning(message: any): void {
        console.log(Chalk.default.yellow(message));
    }

    public static error(message: any): void {
        console.log(Chalk.default.red(message));
    }

    public static info(message: any): void {
        console.log(Chalk.default.blue(message));
    }

    public static isEquivalentObjects(objectA: any, objectB: any) {

        const aProps = Object.getOwnPropertyNames(objectA);
        const bProps = Object.getOwnPropertyNames(objectB);

        if (aProps.length !== bProps.length) {
            return false;
        }

        for (let i = 0; i < aProps.length; i++) {
            const propName = aProps[i];

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

    constructor() {
    }

}
