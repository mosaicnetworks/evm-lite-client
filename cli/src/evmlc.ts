#!/usr/bin/env node

import * as tomlify from 'tomlify-j0.4'
import * as toml from 'toml';
import * as JSONBig from 'json-bigint';
import * as fs from 'fs';
import * as Vorpal from "vorpal";

import {Account, Controller} from '../../index';
import {error} from "./utils/functions";

import commandAccountsCreate from './commands/AccountsCreate';
import commandAccountsList from './commands/AccountsList';
import commandAccountsGet from './commands/AccountsGet';
import commandGlobals from "./commands/Globals";
import commandTransfer from "./commands/Transfer";
import commandConfig from "./commands/Config";


let config: any;
let evmlcDir = `${require('os').homedir()}/.evmlc`;
let configDir = 'config';
let path = `${evmlcDir}/${configDir}/evml_cli_config.toml`;
let defaultConfig = {
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
        keystore: '/Users/danu/Library/EVMLITE/eth/keystore',
        password: '/Users/danu/Library/EVMLITE/eth/pwd.txt'
    }
};

export let node: Controller = null;
export const updateToConfigFile = (): void => {
    writeToConfigFile(config).then();
};
export const connect = () => {
    return new Promise<void>((resolve, reject) => {
        if (node === null) {
            node = new Controller(config.connection.host, config.connection.port || 8080);
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
            fs.mkdirSync(evmlcDir);
        }
        if (!fs.existsSync(evmlcDir + '/' + configDir)) {
            fs.mkdirSync(evmlcDir + '/' + configDir);
        }
        fs.writeFileSync(path, tomlified);

        config = toml.parse(tomlified);
        resolve();
    })
};
const readConfigFile = () => {
    return new Promise<void>((resolve) => {
        let tomlstring = fs.readFileSync(path, 'utf8');
        config = toml.parse(tomlstring);
        resolve();
    })
};
const createOrReadConfigFile = (): Promise<any> => {
    return new Promise(resolve => {
        if (fs.existsSync(path)) {
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

        // commands
        commandAccountsCreate(evmlc, config);
        commandAccountsList(evmlc, config);
        commandAccountsGet(evmlc, config);
        commandGlobals(evmlc, config);
        commandTransfer(evmlc, config);
        commandConfig(evmlc, config);

        if (process.argv[2] === 'interactive') {
            evmlc.delimiter('evmlc$').show();
        } else {
            evmlc.parse(process.argv);
        }
    })
    .catch(() => {
        error(`Could not connect.`);
    });

