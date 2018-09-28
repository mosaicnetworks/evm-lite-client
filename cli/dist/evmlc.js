#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tomlify = require("tomlify-j0.4");
const toml = require("toml");
const JSONBig = require("json-bigint");
const fs = require("fs");
const Vorpal = require("vorpal");
const index_1 = require("../../index");
const functions_1 = require("./utils/functions");
const AccountsCreate_1 = require("./commands/AccountsCreate");
const AccountsList_1 = require("./commands/AccountsList");
const AccountsGet_1 = require("./commands/AccountsGet");
const Globals_1 = require("./commands/Globals");
const Transfer_1 = require("./commands/Transfer");
const Config_1 = require("./commands/Config");
let config;
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
exports.node = null;
exports.updateToConfigFile = () => {
    writeToConfigFile(config).then();
};
exports.connect = () => {
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
const writeToConfigFile = (content) => {
    let tomlified = tomlify.toToml(content, { spaces: 2 });
    return new Promise((resolve) => {
        if (!fs.existsSync(evmlcDir)) {
            fs.mkdirSync(evmlcDir);
        }
        if (!fs.existsSync(evmlcDir + '/' + configDir)) {
            fs.mkdirSync(evmlcDir + '/' + configDir);
        }
        fs.writeFileSync(path, tomlified);
        config = toml.parse(tomlified);
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
            writeToConfigFile(defaultConfig).then(() => {
                resolve();
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
    AccountsCreate_1.default(evmlc, config);
    AccountsList_1.default(evmlc, config);
    AccountsGet_1.default(evmlc, config);
    Globals_1.default(evmlc, config);
    Transfer_1.default(evmlc, config);
    Config_1.default(evmlc, config);
    if (process.argv[2] === 'interactive') {
        evmlc.delimiter('evmlc$').show();
    }
    else {
        evmlc.parse(process.argv);
    }
})
    .catch(() => {
    functions_1.error(`Could not connect.`);
});
