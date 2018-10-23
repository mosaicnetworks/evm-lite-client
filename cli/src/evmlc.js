#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Vorpal = require("vorpal");
const mkdir = require("mkdirp");
const figlet = require("figlet");
const Globals_1 = require("./utils/Globals");
const Session_1 = require("./classes/Session");
const Staging_1 = require("./classes/Staging");
const TransactionsList_1 = require("./commands/TransactionsList");
const TransactionsGet_1 = require("./commands/TransactionsGet");
const AccountsUpdate_1 = require("./commands/AccountsUpdate");
const AccountsCreate_1 = require("./commands/AccountsCreate");
const AccountsList_1 = require("./commands/AccountsList");
const AccountsGet_1 = require("./commands/AccountsGet");
const Interactive_1 = require("./commands/Interactive");
const ConfigView_1 = require("./commands/ConfigView");
const ConfigSet_1 = require("./commands/ConfigSet");
const Transfer_1 = require("./commands/Transfer");
const Test_1 = require("./commands/Test");
const Info_1 = require("./commands/Info");
const Clear_1 = require("./commands/Clear");
const LogsView_1 = require("./commands/LogsView");
const LogsClear_1 = require("./commands/LogsClear");
const init = () => {
    return new Promise(resolve => {
        if (!Staging_1.default.exists(Globals_1.default.evmlcDir)) {
            mkdir.mkdirp(Globals_1.default.evmlcDir);
        }
        resolve();
    });
};
/**
 * EVM-Lite Command Line Interface
 */
init()
    .then(() => {
    let dataDirPath = Globals_1.default.evmlcDir;
    if ((process.argv[2] === '--datadir' || process.argv[2] === '-d')) {
        dataDirPath = process.argv[3];
        if (!Staging_1.default.exists(process.argv[3])) {
            Globals_1.default.warning('Data directory file path provided does not exist and hence will created...');
        }
        process.argv.splice(2, 2);
    }
    let session = new Session_1.default(dataDirPath);
    if (!process.argv[2]) {
        console.log(`\n  A Command Line Interface to interact with EVM-Lite.`);
        console.log(`\n  Current Data Directory: ${session.directory.path}`);
        process.argv[2] = 'help';
    }
    return session;
})
    .then((session) => {
    const evmlc = new Vorpal().version("0.1.0");
    [
        AccountsUpdate_1.default,
        ConfigView_1.default,
        ConfigSet_1.default,
        AccountsCreate_1.default,
        AccountsList_1.default,
        AccountsGet_1.default,
        Interactive_1.default,
        Transfer_1.default,
        Info_1.default,
        Test_1.default,
        TransactionsList_1.default,
        TransactionsGet_1.default,
        LogsView_1.default,
        LogsClear_1.default,
        Clear_1.default,
    ].forEach(command => {
        command(evmlc, session);
    });
    return {
        instance: evmlc,
        session: session
    };
})
    .then((cli) => __awaiter(this, void 0, void 0, function* () {
    if (process.argv[2] === 'interactive' || process.argv[2] === 'i') {
        console.log(figlet.textSync('EVM-Lite CLI', {}));
        Globals_1.default.warning(` Mode:        Interactive`);
        Globals_1.default.warning(` Data Dir:    ${cli.session.directory.path}`);
        Globals_1.default.info(` Config File: ${cli.session.config.path}`);
        Globals_1.default.info(` Keystore:    ${cli.session.keystore.path}`);
        let cmdInteractive = cli.instance.find('interactive');
        if (cmdInteractive) {
            cmdInteractive.hidden();
        }
        yield cli.instance.exec('help');
        cli.session.interactive = true;
        cli.instance.delimiter('evmlc$').show();
    }
    else {
        let cmdClear = cli.instance.find('clear');
        if (cmdClear) {
            cmdClear.hidden();
        }
        cli.instance.parse(process.argv);
    }
}))
    .catch(err => Globals_1.default.error(err));
