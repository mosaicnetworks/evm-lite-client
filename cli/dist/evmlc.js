#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
const tomlify = require("tomlify-j0.4");
const toml = require("toml");
const JSONBig = require("json-bigint");
const fs = require("fs");
const Vorpal = require("vorpal");
const index_1 = require("../../index");
const functions_1 = require("./utils/functions");
const AccountsCreate_1 = require("./commands/AccountsCreate");
const AccountsList_1 = require("./commands/AccountsList");
const Globals_1 = require("./commands/Globals");
const Transfer_1 = require("./commands/Transfer");
const Config_1 = require("./commands/Config");
const evmlc = new Vorpal();
let config;
exports.node = null;
let path = `${__dirname}/evml_cli_config.toml`;
let defaultContent = `title = "EVM-Lite CLI Config"

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
exports.updateToConfigFile = () => {
    let toml = tomlify.toToml(config, {spaces: 2});
    writeToConfigFile(toml).then();
};
const writeToConfigFile = (content) => {
    return new Promise((resolve) => {
        fs.writeFileSync(path, content);
        config = toml.parse(content);
        resolve();
    });
};
const readConfigFile = () => {
    return new Promise((resolve) => {
        let tomlstring = fs.readFileSync(path, 'utf8');
        config = toml.parse(tomlstring);
        resolve();
    });
};
const createOrReadConfigFile = () => {
    return new Promise(resolve => {
        if (fs.existsSync(path)) {
            readConfigFile().then(() => {
                resolve();
            }).catch();
        }
        else {
            writeToConfigFile(defaultContent).then(() => {
                resolve();
            }).catch();
        }
    });
};
const connect = () => {
    return new Promise((resolve, reject) => {
        if (exports.node === null) {
            exports.node = new index_1.Controller(config.connection.host, config.connection.port || 8080);
            return exports.node.api.getAccounts().then((accounts) => {
                exports.node.accounts = JSONBig.parse(accounts).accounts;
                resolve();
            })
                .catch((err) => {
                    exports.node = null;
                    functions_1.error(err);
                    reject();
                });
        }
        else {
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
    }
    else {
        process.argv[2] = 'help';
    }
})
    .then(() => {
        evmlc.version("0.1.0");
        AccountsCreate_1.default(evmlc, config);
        AccountsList_1.default(evmlc, config);
        Globals_1.default(evmlc, config);
        Transfer_1.default(evmlc, config);
        Config_1.default(evmlc, config);
        evmlc.parse(process.argv);
    })
    .catch(() => {
        functions_1.warning(`Update global connection config using 
    globals --host <host> --port <port>`);
    });
