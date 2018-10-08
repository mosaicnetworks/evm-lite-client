#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const Vorpal = require("vorpal");
const functions_1 = require("./utils/functions");
const globals_1 = require("./utils/globals");
const AccountsCreate_1 = require("./commands/AccountsCreate");
const AccountsList_1 = require("./commands/AccountsList");
const AccountsGet_1 = require("./commands/AccountsGet");
const Globals_1 = require("./commands/Globals");
const Transfer_1 = require("./commands/Transfer");
const Config_1 = require("./commands/Config");
const Interactive_1 = require("./commands/Interactive");
const Test_1 = require("./commands/Test");
const RootConfig_1 = require("./utils/RootConfig");
const UserConfig_1 = require("./utils/UserConfig");
// global interactive mode
exports.interactive = false;
/**
 * Main Program
 */
globals_1.createDefaultDirectories()
    .then(() => {
    // default root config
    let rootConfig = new RootConfig_1.default(globals_1.rootConfigFilePath);
    let userConfigPath = path.join(rootConfig.data.storage.configDirectory, 'config.toml');
    let userConfig = new UserConfig_1.default(userConfigPath);
    // if no commands are given output help by default
    if (!process.argv[2]) {
        process.argv[2] = 'help';
    }
    return userConfig;
})
    .then((userConfig) => {
    // create new Vorpal instance
    const evmlc = new Vorpal().version("0.1.0");
    // commands: (Vorpal, {}) => Vorpal.Command
    AccountsCreate_1.default(evmlc, userConfig);
    AccountsList_1.default(evmlc, userConfig);
    AccountsGet_1.default(evmlc, userConfig);
    Interactive_1.default(evmlc, userConfig);
    Globals_1.default(evmlc, userConfig);
    Transfer_1.default(evmlc, userConfig);
    Config_1.default(evmlc, userConfig);
    Test_1.default(evmlc, userConfig);
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
    .catch(err => functions_1.error(err));
