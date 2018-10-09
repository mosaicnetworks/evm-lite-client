#!/usr/bin/env node

import * as Vorpal from "vorpal";
import * as figlet from 'figlet';
import * as fs from "fs";

import {defaultConfigFilePath, error, initDirectories, warning} from "./utils/globals";

import commandAccountsCreate from './commands/AccountsCreate';
import commandAccountsList from './commands/AccountsList';
import commandAccountsGet from './commands/AccountsGet';
import commandInteractive from "./commands/Interactive";
import commandConfigView from "./commands/ConfigView";
import commandConfigSet from "./commands/ConfigSet";
import commandTransfer from "./commands/Transfer";
import commandTest from "./commands/Test";

import Config from "./classes/Config";


// global interactive mode and config file
export let interactive: boolean = false;
export let interactiveConfig: Config;


/**
 * EVM-Lite Command Line Interface
 */
initDirectories()
    .then(() => {

        // create new Vorpal instance
        const evmlc = new Vorpal().version("0.1.0");

        /**
         *commands: (Vorpal) => Vorpal.Command
         */

        // Config commands
        commandConfigView(evmlc);
        commandConfigSet(evmlc);

        // Account commands
        commandAccountsCreate(evmlc);
        commandAccountsList(evmlc);
        commandAccountsGet(evmlc);

        commandInteractive(evmlc);
        commandTransfer(evmlc);
        commandTest(evmlc);

        if (!process.argv[2]) {

            console.log(`\n  A Command Line Interface to interact with EVM-Lite.`);

            // if no commands are given output help by default
            process.argv[2] = 'help';

        }

        if (process.argv[2] === 'interactive' || process.argv[2] === 'i') {

            // set config path for interactive mode
            let configFilePath: string = defaultConfigFilePath;

            if ((process.argv[3] === '--config' || process.argv[3] === '-c')) {
                if (fs.existsSync(process.argv[4])) {
                    configFilePath = process.argv[4];
                } else {
                    warning('Config file path provided does not exists. Loading default config...');
                }
            }
            // set global interactive variable so all commands inherit interactive mode
            interactive = true;
            interactiveConfig = new Config(configFilePath);

            figlet('EVM-Lite CLI', (err, data) => {

                console.log(data);
                console.log('Entered interactive mode with configuration file: ' + configFilePath);

                // show interactive console
                evmlc.delimiter('evmlc$').show();

            });

        } else {

            // parse non-interactive command
            evmlc.parse(process.argv);

        }

    })
    .catch(err => error(err));