#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vorpal = require("vorpal");
const figlet = require("figlet");
const fs = require("fs");
const globals_1 = require("./utils/globals");
const AccountsCreate_1 = require("./commands/AccountsCreate");
const AccountsList_1 = require("./commands/AccountsList");
const AccountsGet_1 = require("./commands/AccountsGet");
const Interactive_1 = require("./commands/Interactive");
const ConfigView_1 = require("./commands/ConfigView");
const ConfigSet_1 = require("./commands/ConfigSet");
const Transfer_1 = require("./commands/Transfer");
const Info_1 = require("./commands/Info");
const Test_1 = require("./commands/Test");
const Session_1 = require("./classes/Session");
/**
 * EVM-Lite Command Line Interface
 */
globals_1.initDirectories()
    // custom parse data dir
    .then(() => {
    // set data directory
    // initially set to default
    // unless overridden by --datadir or -d
    let dataDirPath = globals_1.evmlcDir;
    if ((process.argv[2] === '--datadir' || process.argv[2] === '-d')) {
        dataDirPath = process.argv[3];
        if (!fs.existsSync(process.argv[3])) {
            globals_1.warning('Data directory file path provided does not exist and hence will created...');
        }
        // remove the flag and its value
        process.argv.splice(2, 2);
    }
    let session = new Session_1.default(dataDirPath);
    // show default help if no commands are provided
    if (!process.argv[2]) {
        console.log(`\n  A Command Line Interface to interact with EVM-Lite.`);
        console.log(`\n  Current Data Directory: ${session.directory.path}`);
        // if no commands are given output help by default
        process.argv[2] = 'help';
    }
    return session;
})
    // add commands
    .then((session) => {
    // create new Vorpal instance
    const evmlc = new Vorpal().version("0.1.0");
    // Config commands
    ConfigView_1.default(evmlc, session);
    ConfigSet_1.default(evmlc, session);
    // Account commands
    AccountsCreate_1.default(evmlc, session);
    AccountsList_1.default(evmlc, session);
    AccountsGet_1.default(evmlc, session);
    // Others
    Interactive_1.default(evmlc, session);
    Transfer_1.default(evmlc, session);
    Info_1.default(evmlc, session);
    Test_1.default(evmlc, session);
    return {
        instance: evmlc,
        session: session
    };
})
    // custom parse interactive mode
    .then((cli) => {
    if (process.argv[2] === 'interactive' || process.argv[2] === 'i') {
        // set global interactive variable so all commands inherit interactive mode
        cli.session.interactive = true;
        figlet('EVM-Lite CLI', (err, data) => {
            globals_1.info(`${data} \n Entered interactive mode with configuration file: ${cli.session.config.path}`);
            // show interactive console
            cli.instance.delimiter('evmlc$').show();
        });
    }
    else {
        // parse non-interactive command
        cli.instance.parse(process.argv);
    }
})
    .catch(err => globals_1.error(err));
