#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tomlify = require("tomlify-j0.4");
const toml = require("toml");
const fs = require("fs");
const path = require("path");
const Vorpal = require("vorpal");
const mkdir = require("mkdirp");
const functions_1 = require("./utils/functions");
const lib_1 = require("../../lib");
const AccountsCreate_1 = require("./commands/AccountsCreate");
const AccountsList_1 = require("./commands/AccountsList");
const AccountsGet_1 = require("./commands/AccountsGet");
const Globals_1 = require("./commands/Globals");
const Transfer_1 = require("./commands/Transfer");
const Config_1 = require("./commands/Config");
const Interactive_1 = require("./commands/Interactive");
exports.interactive = false;
let evmlcDir = path.join(require('os').homedir(), '.evmlc');
let configDir = path.join(evmlcDir, 'config');
let configFilePath = path.join(configDir, 'evml_cli_config.toml');
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
        keystore: path.join(evmlcDir, 'eth', 'keystore'),
        password: path.join(evmlcDir, 'eth', 'pwd.txt')
    }
};
let node = null;
exports.updateToConfigFile = (config) => {
    writeToConfigFile(config).then();
};
exports.connect = () => {
    return new Promise((resolve, reject) => {
        if (!node) {
            node = new lib_1.Controller(defaultConfig.connection.host, defaultConfig.connection.port || 8080);
            node.api.getAccounts().then((accounts) => {
                resolve(node);
            })
                .catch((err) => {
                node = null;
                functions_1.warning(err);
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
        defaultConfig = content;
        resolve();
    });
};
const readConfigFile = () => {
    return new Promise((resolve) => {
        let tomlstring = fs.readFileSync(configFilePath, 'utf8');
        defaultConfig = toml.parse(tomlstring);
        resolve();
    });
};
const createOrReadConfigFile = () => {
    return new Promise(resolve => {
        if (fs.existsSync(configFilePath)) {
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
    AccountsCreate_1.default(evmlc, defaultConfig);
    AccountsList_1.default(evmlc, defaultConfig);
    AccountsGet_1.default(evmlc, defaultConfig);
    Interactive_1.default(evmlc, defaultConfig);
    Globals_1.default(evmlc, defaultConfig);
    Transfer_1.default(evmlc, defaultConfig);
    Config_1.default(evmlc, defaultConfig);
    if (process.argv[2] === 'interactive' || process.argv[2] === 'i') {
        exports.interactive = true;
        evmlc.delimiter('evmlc$').show();
    }
    else {
        evmlc.parse(process.argv);
    }
})
    .catch(() => {
    functions_1.error(`Could not connect.`);
});
