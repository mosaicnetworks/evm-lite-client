#!/usr/bin/env node

/**
 * @file AccountsCreate.ts
 * @author Mosaic Networks <https://github.com/mosaicnetworks>
 * @date 2018
 */

import * as figlet from 'figlet';
import * as mkdir from 'mkdirp';
import * as Vorpal from "vorpal";

import Globals, {CommandFunction} from "./utils/Globals";

import Session from "./classes/Session";
import Staging from "./classes/Staging";

import AccountsCreate from './commands/AccountsCreate';
import AccountsGet from './commands/AccountsGet';
import AccountsList from './commands/AccountsList';
import AccountsUpdate from './commands/AccountsUpdate';
import Clear from "./commands/Clear";
import ConfigSet from "./commands/ConfigSet";
import ConfigView from "./commands/ConfigView";
import Info from "./commands/Info";
import Interactive from "./commands/Interactive";
import LogsClear from "./commands/LogsClear";
import LogsView from "./commands/LogsView";
import Test from "./commands/Test";
import TransactionsGet from "./commands/TransactionsGet";
import TransactionsList from "./commands/TransactionsList";
import Transfer from "./commands/Transfer";

const __VERSION = '0.1.1';
const init = (): Promise<void> => {
    return new Promise<void>(resolve => {
        if (!Staging.exists(Globals.evmlcDir)) {
            mkdir.mkdirp(Globals.evmlcDir);
        }
        resolve();
    });
};


/**
 * EVM-Lite Command Line Interface
 *
 * You can enter interactive mode by using the command `interactive, i`.
 * Running any command will provide you with a step by step dialogue to executing
 * that command with the respective options.
 */
init()
    // configure data directory path
    .then(() => {
        let dataDirPath: string = Globals.evmlcDir;

        if ((process.argv[2] === '--datadir' || process.argv[2] === '-d')) {
            dataDirPath = process.argv[3];

            if (!Staging.exists(process.argv[3])) {
                Globals.warning('Data directory file path provided does not exist and hence will created...');
            }

            process.argv.splice(2, 2);
        }

        const session = new Session(dataDirPath);

        if (!process.argv[2]) {
            console.log('\n  A Command Line Interface to interact with EVM-Lite.');
            console.log(`\n  Current Data Directory: ` + session.directory.path);

            process.argv[2] = 'help';
        }

        return session;
    })
    // add commands
    .then((session: Session) => {
        const evmlc = new Vorpal().version(__VERSION);

        [
            AccountsUpdate,
            ConfigView,
            ConfigSet,
            AccountsCreate,
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
            Clear,
        ].forEach((command: CommandFunction) => {
            command(evmlc, session);
        });

        return {
            instance: evmlc,
            session
        }
    })
    // parse interactive and non interactive commands
    .then(async (cli: { instance: Vorpal, session: Session }) => {
        if (process.argv[2] === 'interactive' || process.argv[2] === 'i') {
            console.log(figlet.textSync('EVM-Lite CLI', {}));
            Globals.warning(` Mode:        Interactive`);
            Globals.warning(` Data Dir:    ${cli.session.directory.path}`);
            Globals.info(` Config File: ${cli.session.config.path}`);
            Globals.info(` Keystore:    ${cli.session.keystore.path}`);

            const cmdInteractive = cli.instance.find('interactive');
            if (cmdInteractive) {
                cmdInteractive.hidden();
            }

            await cli.instance.exec('help');

            cli.session.interactive = true;
            cli.instance.delimiter('evmlc$').show();
        } else {
            const cmdClear = cli.instance.find('clear');
            if (cmdClear) {
                cmdClear.hidden();
            }

            cli.instance.parse(process.argv);
        }
    })
    // catch errors.
    .catch(err => console.log(err));