#!/usr/bin/env node

import * as Vorpal from "vorpal";
import * as fs from "fs";
import * as mkdir from 'mkdirp';

import Globals from "./utils/Globals";
import Session from "./classes/Session";

import TransactionsList from "./commands/TransactionsList";
import TransactionsGet from "./commands/TransactionsGet";
import AccountCreate from './commands/AccountsCreate';
import AccountsList from './commands/AccountsList';
import AccountsGet from './commands/AccountsGet';
import Interactive from "./commands/Interactive";
import ConfigView from "./commands/ConfigView";
import ConfigSet from "./commands/ConfigSet";
import Transfer from "./commands/Transfer";
import Test from "./commands/Test";
import Info from "./commands/Info";
import LogsView from "./commands/LogsView";
import LogsClear from "./commands/LogsClear";


const init = (): Promise<void> => {
    return new Promise<void>(resolve => {
        if (!fs.existsSync(Globals.evmlcDir)) {
            mkdir.mkdirp(Globals.evmlcDir);
        }
        resolve();
    });
};

/**
 * EVM-Lite Command Line Interface
 */
init()
    .then(() => {
        let dataDirPath: string = Globals.evmlcDir;

        if ((process.argv[2] === '--datadir' || process.argv[2] === '-d')) {
            dataDirPath = process.argv[3];

            if (!fs.existsSync(process.argv[3])) {
                Globals.warning('Data directory file path provided does not exist and hence will created...');
            }

            process.argv.splice(2, 2);
        }

        let session = new Session(dataDirPath);

        if (!process.argv[2]) {
            console.log(`\n  A Command Line Interface to interact with EVM-Lite.`);
            console.log(`\n  Current Data Directory: ${session.directory.path}`);

            process.argv[2] = 'help';
        }

        return session;
    })
    .then((session: Session) => {
        const evmlc = new Vorpal().version("0.1.0");

        [
            ConfigView,
            ConfigSet,
            AccountCreate,
            AccountsList,
            AccountsGet,
            Interactive,
            Transfer,
            Info,
            Test,
            TransactionsList,
            TransactionsGet,
            LogsView,
            LogsClear,
        ].forEach(command => {
            command(evmlc, session);
        });

        return {
            instance: evmlc,
            session: session
        }
    })
    .then((cli: { instance: Vorpal, session: Session }) => {
        if (process.argv[2] === 'interactive' || process.argv[2] === 'i') {
            Globals.info(`Entered interactive mode with data directory: ${cli.session.directory.path}`);
            cli.session.interactive = true;
            cli.instance.delimiter('evmlc$').show();
        } else {
            cli.instance.parse(process.argv);
        }
    })
    .catch(err => Globals.error(err));