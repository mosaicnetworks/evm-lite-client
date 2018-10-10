#!/usr/bin/env node

import * as Vorpal from "vorpal";
import * as figlet from 'figlet';
import * as fs from "fs";

import {error, evmlcDir, info, initDirectories, warning} from "./utils/globals";

import commandAccountsCreate from './commands/AccountsCreate';
import commandAccountsList from './commands/AccountsList';
import commandAccountsGet from './commands/AccountsGet';
import commandInteractive from "./commands/Interactive";
import commandConfigView from "./commands/ConfigView";
import commandConfigSet from "./commands/ConfigSet";
import commandTransfer from "./commands/Transfer";
import commandInfo from "./commands/Info";
import commandTest from "./commands/Test";

import Session from "./classes/Session";


/**
 * EVM-Lite Command Line Interface
 */
initDirectories()

    // custom parse data dir
    .then(() => {
        // set data directory
        // initially set to default
        // unless overridden by --datadir or -d
        let dataDirPath: string = evmlcDir;

        if ((process.argv[2] === '--datadir' || process.argv[2] === '-d')) {
            dataDirPath = process.argv[3];

            if (!fs.existsSync(process.argv[3])) {
                warning('Data directory file path provided does not exist and hence will created...');
            }

            // remove the flag and its value
            process.argv.splice(2, 2);
        }

        let session = new Session(dataDirPath);

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
    .then((session: Session) => {
        // create new Vorpal instance
        const evmlc = new Vorpal().version("0.1.0");

        // Config commands
        commandConfigView(evmlc, session);
        commandConfigSet(evmlc, session);

        // Account commands
        commandAccountsCreate(evmlc, session);
        commandAccountsList(evmlc, session);
        commandAccountsGet(evmlc, session);

        // Others
        commandInteractive(evmlc, session);
        commandTransfer(evmlc, session);
        commandInfo(evmlc, session);
        commandTest(evmlc, session);

        return {
            instance: evmlc,
            session: session
        }
    })

    // custom parse interactive mode
    .then((cli: {instance: Vorpal, session: Session}) => {
        if (process.argv[2] === 'interactive' || process.argv[2] === 'i') {
            // set global interactive variable so all commands inherit interactive mode
            cli.session.interactive = true;
            figlet('EVM-Lite CLI', (err, data) => {
                info(`${data} \n Entered interactive mode with configuration file: ${cli.session.config.path}`);
                // show interactive console
                cli.instance.delimiter('evmlc$').show();
            });
        } else {
            // parse non-interactive command
            cli.instance.parse(process.argv);
        }
    })
    .catch(err => error(err));