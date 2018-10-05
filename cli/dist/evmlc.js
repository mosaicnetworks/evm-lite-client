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
// global interactive mode
exports.interactive = false;
// paths
let evmlcDir = path.join(require('os').homedir(), '.evmlc');
let configDir = path.join(evmlcDir, 'config');
let configFilePath = path.join(configDir, 'evmlc.toml');
// connection to node
// when in interactive mode this is resolved instead
// of connecting multiple times to improve console speed
let node = null;
// default config layout
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
        keystore: path.join(evmlcDir, 'keystore'),
        password: path.join(evmlcDir, 'pwd.txt')
    }
};
/**
 * Should update config file and set default config variable.
 *
 * @param {T} config - Config object to update file to.
 * @returns void
 */
function updateToConfigFile(config) {
    writeToConfigFile(config)
        .then((writtenConfig) => {
        defaultConfig = writtenConfig;
    });
}
exports.updateToConfigFile = updateToConfigFile;
/**
 * Should attempt to connect to node with the config connection parameters
 * then try and get accounts to make sure the connection is valid then
 * returns a promise which resolves the respective Controller object.
 *
 * @param {{}} config - The config object
 * @returns Promise<Controller>
 */
exports.connect = (config) => {
    return new Promise((resolve, reject) => {
        if (!node) {
            node = new lib_1.Controller(config.connection.host, config.connection.port || 8080);
            node.api.getAccounts().then(() => {
                resolve(node);
            })
                .catch((err) => {
                node = null;
                functions_1.warning(err);
                reject();
            });
        }
        else {
            resolve(node);
        }
    });
};
/**
 * Should write a config object to the config file and then resolve a promise
 * with the config object.
 *
 * @param {T} content - The content to write to config file.
 * @returns Promise<{}>
 */
function writeToConfigFile(content) {
    // currently only supports {} to TOML
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
        resolve(content);
    });
}
/**
 * Should read from the config file and resolve a promise with an object
 * representing the file.
 *
 * @returns Promise<{}>
 */
const readConfigFile = () => {
    return new Promise((resolve) => {
        let tomlstring = fs.readFileSync(configFilePath, 'utf8');
        resolve(toml.parse(tomlstring));
    });
};
/**
 * Should create or read config file depending on whether it exists or not
 * then resolves a promise with the parsed config object.
 *
 * @returns Promise<{}>
 */
const createOrReadConfigFile = () => {
    return new Promise(resolve => {
        if (fs.existsSync(configFilePath)) {
            readConfigFile()
                .then((config) => {
                resolve(config);
            })
                .catch(err => functions_1.error(err));
        }
        else {
            writeToConfigFile(defaultConfig)
                .then((config) => {
                resolve(config);
            })
                .catch(err => functions_1.error(err));
        }
    });
};
/**
 * Main Program
 */
createOrReadConfigFile()
    .then((config) => {
    // if no commands are given output help by default
    if (!process.argv[2]) {
        process.argv[2] = 'help';
    }
    return config;
})
    .then((config) => {
    // create new Vorpal instance
    const evmlc = new Vorpal().version("0.1.0");
    // commands: (Vorpal, {}) => Vorpal.Command
    AccountsCreate_1.default(evmlc, config);
    AccountsList_1.default(evmlc, config);
    AccountsGet_1.default(evmlc, config);
    Interactive_1.default(evmlc, config);
    Globals_1.default(evmlc, config);
    Transfer_1.default(evmlc, config);
    Config_1.default(evmlc, config);
    // manual processing of interactive mode
    if (process.argv[2] === 'interactive' || process.argv[2] === 'i') {
        // set global interactive variable so all commands inherit interactive mode
        exports.interactive = true;
        // show interactive console
        evmlc.delimiter('evmlc$').show();
    }
    else {
        // parse non-interactive command
        evmlc.parse(process.argv);
    }
})
    .catch(() => functions_1.error(`Error reading config file.`));
