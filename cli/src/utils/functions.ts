import * as Chalk from "chalk";
import * as fs from "fs";
import {Account, Controller} from "../../../lib";
import * as JSONBig from 'json-bigint';
import * as path from "path";


const l = console.log;
const chalk = Chalk.default;

export interface BaseAccount {
    address: string,
    nonce: number,
    balance: number
}

export const getPassword = (passwordPath: string): string => {
    if (passwordPath) {
        return fs.readFileSync(passwordPath, 'utf8');
    } else {
        return undefined;
    }
};


export const success = (message: any): void => l(chalk.green(message));
export const warning = (message: any): void => l(chalk.yellow(message));
export const error = (message: any): void => l(chalk.red(message));
export const info = (message: any): void => l(chalk.blue(message));


export const decryptLocalAccounts = (node: Controller, keystorePath: string, passwordPath: string): Promise<Account[]> => {
    let accounts: Account[] = [];
    let promises = [];
    let keyStoreFiles = fs.readdirSync(keystorePath);

    keyStoreFiles.forEach((file) => {
        if (!file.startsWith('.')) {
            let keystoreFile = path.join(keystorePath, file);
            let password = getPassword(passwordPath);
            let v3JSONKeyStore = JSONBig.parse(fs.readFileSync(keystoreFile, 'utf8'));
            let decryptedAccount = Account.decrypt(v3JSONKeyStore, password);

            promises.push(
                node.api.getAccount(decryptedAccount.address).then((a) => {
                    let account: BaseAccount = JSONBig.parse(a);

                    decryptedAccount.balance = account.balance;
                    decryptedAccount.nonce = account.nonce;

                    accounts.push(decryptedAccount);
                })
            );
        }
    });

    return Promise.all(promises)
        .then(() => {
            return new Promise<Account[]>(resolve => {
                resolve(accounts);
            });
        })
        .catch(err => {
            error(err);
            return new Promise<Account[]>(resolve => {
                resolve([])
            })
        })

};