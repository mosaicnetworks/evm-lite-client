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
import commandGlobals from "./commands/Globals";
import commandTransfer from "./commands/Transfer";
import commandConfig from "./commands/Config";


const evmlc = new Vorpal();
export let node: Controller = null;

let config: any;
let evmlcDir = `${require('os').homedir()}/.evmlc`;
let configDir = 'config';
let path = `${evmlcDir}/${configDir}/evml_cli_config.toml`;
let defaultContent =
    `title = "EVM-Lite CLI Config"

[connection]
host = "127.0.0.1"
port = 8080

[defaults]
from = ""
gas = 0
gasPrice = 0

[storage]
keystore = "/Users/danu/Library/EVMLITE/eth/keystore"
password = "/Users/danu/Library/EVMLITE/eth/pwd.txt"`;

export const updateToConfigFile = (): void => {
    let toml = tomlify.toToml(config, {spaces: 2});
    writeToConfigFile(toml).then();
};

const writeToConfigFile = (content: string) => {
    return new Promise<void>((resolve) => {
        if (!fs.existsSync(evmlcDir)) {
            fs.mkdirSync(evmlcDir);
        }
        if (!fs.existsSync(evmlcDir + '/' + configDir)) {
            fs.mkdirSync(evmlcDir + '/' + configDir);
        }
        fs.writeFileSync(path, content);
        config = toml.parse(content);
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
            writeToConfigFile(defaultContent).then(() => {
                resolve()
            }).catch();
        }
    });

};

const connect = () => {
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

// Start or catch CLI errors
createOrReadConfigFile().then(() => {
    if (process.argv[2]) {
        if (['globals', 'config', 'help'].indexOf(process.argv[2]) < 0) {
            return connect();
        }
    } else {
        process.argv[2] = 'help';
    }
})
    .then(() => {
        // console.log(require('os').homedir());
        evmlc.version("0.1.0");
        commandAccountsCreate(evmlc, config);
        commandAccountsList(evmlc, config);
        commandGlobals(evmlc, config);
        commandTransfer(evmlc, config);
        commandConfig(evmlc, config);
        evmlc.parse(process.argv);
    })
    .catch(() => {
        error(`Could not connect.`);
    });

