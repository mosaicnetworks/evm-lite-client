#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vorpal = require("vorpal");
const figlet = require("figlet");
const globals_1 = require("./utils/globals");
const AccountsCreate_1 = require("./commands/AccountsCreate");
const AccountsList_1 = require("./commands/AccountsList");
const AccountsGet_1 = require("./commands/AccountsGet");
const Interactive_1 = require("./commands/Interactive");
const ConfigView_1 = require("./commands/ConfigView");
const ConfigSet_1 = require("./commands/ConfigSet");
const Transfer_1 = require("./commands/Transfer");
const Test_1 = require("./commands/Test");
const Config_1 = require("./classes/Config");
// global interactive mode and config file
exports.interactive = false;
/**
 * EVM-Lite Command Line Interface
 */
globals_1.initDirectories()
    .then(() => {
    // create new Vorpal instance
    const evmlc = new Vorpal().version("0.1.0");
    /**
     *commands: (Vorpal) => Vorpal.Command
     */
    // Config commands
    ConfigView_1.default(evmlc);
    ConfigSet_1.default(evmlc);
    // Account commands
    AccountsCreate_1.default(evmlc);
    AccountsList_1.default(evmlc);
    AccountsGet_1.default(evmlc);
    Interactive_1.default(evmlc);
    Transfer_1.default(evmlc);
    Test_1.default(evmlc);
    if (!process.argv[2]) {
        console.log(`\n  A Command Line Interface to interact with EVM-Lite.`);
        // if no commands are given output help by default
        process.argv[2] = 'help';
    }
    if (process.argv[2] === 'interactive' || process.argv[2] === 'i') {
        // set config path for interactive mode
        let configFilePath = process.argv[4] || globals_1.defaultConfigFilePath;
        // set global interactive variable so all commands inherit interactive mode
        exports.interactive = true;
        exports.interactiveConfig = new Config_1.default(configFilePath);
        figlet('EVM-Lite CLI', (err, data) => {
            console.log(data);
            console.log('Entered interactive mode with configuration file: ' + configFilePath);
            // show interactive console
            evmlc.delimiter('evmlc$').show();
        });
    }
    else {
        // parse non-interactive command
        evmlc.parse(process.argv);
    }
})
    .catch(err => globals_1.error(err));
