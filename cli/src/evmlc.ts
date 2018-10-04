#!/usr/bin/env node

import * as tomlify from 'tomlify-j0.4'
import * as toml from 'toml';
import * as JSONBig from 'json-bigint';
import * as fs from 'fs';
import * as path from "path";
import * as Vorpal from "vorpal";
import * as mkdir from 'mkdirp';

import {error} from "./utils/functions";

import {Account, Controller} from '../../index';

import commandAccountsCreate from './commands/AccountsCreate';
import commandAccountsList from './commands/AccountsList';
import commandAccountsGet from './commands/AccountsGet';
import commandGlobals from "./commands/Globals";
import commandTransfer from "./commands/Transfer";
import commandConfig from "./commands/Config";
import commandInteractive from "./commands/Interactive";


export let interactive: boolean = false;
let evmlcDir: string = path.join(require('os').homedir(), '.evmlc');
let configDir: string = path.join(evmlcDir, 'config');
let configFilePath: string = path.join(configDir, 'evml_cli_config.toml');
let defaultConfig: any = {
    title: 'EVM-Lite CLI Config',
    connection: {
        host: '127.0.0.1',
        port: '8080'
    },
    defaults: {
        from: '',
        gas: 0,
        gasPrice: 0
    },
    storage: {
        keystore: path.join(evmlcDir, 'eth', 'keystore'),
        password: path.join(evmlcDir, 'eth', 'pwd.txt')
    }
};

export let node: Controller = null;
export const updateToConfigFile: Function = (): void => {
    writeToConfigFile(defaultConfig).then();
};
export const connect = () => {
    return new Promise<void>((resolve, reject) => {
        if (node === null) {
            node = new Controller(defaultConfig.connection.host, defaultConfig.connection.port || 8080);
            return node.api.getAccounts().then((accounts: string) => {
                node.accounts = JSONBig.parse(accounts).accounts;
                resolve();
            })
                .catch((err) => {
                    node = null;
                    error(err);
                    reject();
                });
        } else {
            resolve();
        }
    });
};

const writeToConfigFile = (content: any) => {
    let tomlified = tomlify.toToml(content, {spaces: 2});

    return new Promise<void>((resolve) => {
        if (!fs.existsSync(evmlcDir)) {
            mkdir.mkdirp(evmlcDir);
        }

        if (!fs.existsSync(configDir)) {
            mkdir.mkdirp(configDir);
        }

        if (!fs.existsSync(defaultConfig.storage.keystore)) {
            mkdir.mkdirp(defaultConfig.storage.keystore);
        }

        if (!fs.existsSync(defaultConfig.storage.password)) {
            fs.writeFileSync(defaultConfig.storage.password, 'supersecurepassword');
        }

        fs.writeFileSync(configFilePath, tomlified);
        resolve();
    })
};

const readConfigFile = () => {
    return new Promise<void>((resolve) => {
        let tomlstring = fs.readFileSync(configFilePath, 'utf8');
        defaultConfig = toml.parse(tomlstring);
        resolve();
    })
};

const createOrReadConfigFile = (): Promise<any> => {
    return new Promise(resolve => {
        if (fs.existsSync(configFilePath)) {
            readConfigFile().then(() => {
                resolve();
            }).catch();
        } else {
            writeToConfigFile(defaultConfig).then(() => {
                resolve()
            }).catch();
        }
    });

};

createOrReadConfigFile().then(() => {
    if (!process.argv[2]) {
        process.argv[2] = 'help';
    }
})
    .then(() => {
        const evmlc = new Vorpal().version("0.1.0");

        commandAccountsCreate(evmlc, defaultConfig);
        commandAccountsList(evmlc, defaultConfig);
        commandAccountsGet(evmlc, defaultConfig);
        commandInteractive(evmlc, defaultConfig);
        commandGlobals(evmlc, defaultConfig);
        commandTransfer(evmlc, defaultConfig);
        commandConfig(evmlc, defaultConfig);

        if (process.argv[2] === 'interactive' || process.argv[2] === 'i') {
            interactive = true;
            evmlc.delimiter('evmlc$').show();
        } else {
            evmlc.parse(process.argv);
        }
    })
    .catch(() => {
        error(`Could not connect.`);
    });

