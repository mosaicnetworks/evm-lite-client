import * as path from "path";
import * as fs from "fs";
import * as mkdir from 'mkdirp';
import * as Chalk from "chalk";
import * as JSONBig from 'json-bigint';

import {interactive, interactiveConfig} from "../evmlc";

import {Account, Controller} from "../../../lib";

import Config from "../classes/Config";


const l = console.log;
const chalk = Chalk.default;

export const success = (message: any): void => l(chalk.green(message));
export const warning = (message: any): void => l(chalk.yellow(message));
export const error = (message: any): void => l(chalk.red(message));
export const info = (message: any): void => l(chalk.blue(message));

// global root evmlc directory
export const evmlcDir: string = path.join(require('os').homedir(), '.evmlc');
export const rootConfigDir = path.join(evmlcDir, 'config');
export const defaultConfigDir = path.join(evmlcDir, 'config');
export const defaultConfigFilePath = path.join(defaultConfigDir, 'config.toml');

// connection to node
// when in interactive mode this is resolved instead
// of connecting multiple times to improve console speed
export let node: Controller = undefined;

export interface BaseAccount {
    address: string,
    nonce: number,
    balance: number
}

export const getPassword = (passwordPath: string): string => {
    if (passwordPath) {
        let list = passwordPath.split('/');
        list.pop();

        let pwdDirectory = list.join('/');

        if (!fs.existsSync(pwdDirectory)) {
            mkdir.mkdirp(pwdDirectory);
        }

        if (!fs.existsSync(passwordPath)) {
            let password = 'supersecurepassword';

            fs.writeFileSync(passwordPath, password);

            return password;
        }

        return fs.readFileSync(passwordPath, 'utf8');
    }

    return undefined;
};

export const decryptLocalAccounts = (node: Controller, keystorePath: string, passwordPath: string): Promise<Account[]> => {
    let accounts: Account[] = [];
    let promises = [];
    let keyStoreFiles = fs.readdirSync(keystorePath);

    keyStoreFiles.forEach((file) => {
        if (!file.startsWith('.')) {
            let keystoreFile = path.join(keystorePath, file);
            let password = getPassword(passwordPath);
            let v3JSONKeyStore = JSONBig.parse(fs.readFileSync(keystoreFile, 'utf8'));
            let decryptedAccount: Account = Account.decrypt(v3JSONKeyStore, password);

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
        .catch(() => {
            return new Promise<Account[]>(resolve => {
                resolve([])
            })
        })

};

export const isEquivalentObjects = (objectA: any, objectB: any) => {

    // console.log(objectA);
    // console.log(objectB);

    let aProps = Object.getOwnPropertyNames(objectA);
    let bProps = Object.getOwnPropertyNames(objectB);

    // console.log(aProps);
    // console.log(bProps);

    if (aProps.length != bProps.length) {
        // console.log(`Length: ${aProps.length} !== ${bProps.length}`);
        return false;
    }

    for (let i = 0; i < aProps.length; i++) {
        let propName = aProps[i];
        // console.log(`${objectA[propName]}, ${objectB[propName]}`);
        if (typeof objectA[propName] === 'object' && typeof objectB[propName] === 'object') {
            if (!isEquivalentObjects(objectA[propName], objectB[propName])) {
                return false;
            }
        } else if (objectA[propName] !== objectB[propName]) {
            // console.log(`${objectA[propName]} !== ${objectB[propName]}`);
            return false;
        }
    }

    return true;
};

/**
 * Should attempt to connect to node with the config connection parameters
 * then try and get accounts to make sure the connection is valid then
 * returns a promise which resolves the respective Controller object.
 *
 * @param {Config} config - The config object
 * @returns Promise<Controller>
 */
export const connect = (config: Config): Promise<Controller> => {
    return new Promise<Controller>((resolve, reject) => {
        if (!node) {
            node = new Controller(config.data.connection.host, config.data.connection.port || 8080);
            node.api.getAccounts().then(() => {
                resolve(node);
            })
                .catch((err) => {
                    node = null;
                    warning(err);
                    reject();
                });
        } else {
            resolve(node);
        }
    });
};

export const initDirectories = (): Promise<void> => {
    return new Promise<void>(resolve => {
        // .evmlc
        if (!fs.existsSync(evmlcDir)) {
            mkdir.mkdirp(evmlcDir);
        }
        resolve();
    });
};

export const getConfig = (optionalPath: string): Config => {
    return interactiveConfig || new Config(optionalPath || defaultConfigFilePath)
};

export const getInteractive = (optionalInteractive: boolean): boolean => {
    return optionalInteractive || interactive;
};