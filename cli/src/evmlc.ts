#!/usr/bin/env node

import * as path from "path";
import * as Vorpal from "vorpal";

import {error} from "./utils/functions";
import {createDefaultDirectories, rootConfigFilePath} from "./utils/globals";

import commandAccountsCreate from './commands/AccountsCreate';
import commandAccountsList from './commands/AccountsList';
import commandAccountsGet from './commands/AccountsGet';
import commandGlobals from "./commands/Globals";
import commandTransfer from "./commands/Transfer";
import commandConfig from "./commands/Config";
import commandInteractive from "./commands/Interactive";
import commandTest from "./commands/Test";

import RootConfig from "./classes/RootConfig";
import UserConfig from "./classes/UserConfig";


// global interactive mode
export let interactive: boolean = false;


/**
 * Main Program
 */
createDefaultDirectories()
    .then(() => {

        // default root config
        let rootConfig: RootConfig = new RootConfig(rootConfigFilePath);

        let userConfigPath: string = path.join(rootConfig.data.storage.configDirectory, 'config.toml');
        let userConfig: UserConfig = new UserConfig(userConfigPath);

        // if no commands are given output help by default
        if (!process.argv[2]) {
            process.argv[2] = 'help';
        }

        return userConfig;

    })
    .then((userConfig: UserConfig) => {
        // create new Vorpal instance
        const evmlc = new Vorpal().version("0.1.0");

        // commands: (Vorpal, {}) => Vorpal.Command
        commandAccountsCreate(evmlc, userConfig);
        commandAccountsList(evmlc, userConfig);
        commandAccountsGet(evmlc, userConfig);
        commandInteractive(evmlc, userConfig);
        commandGlobals(evmlc, userConfig);
        commandTransfer(evmlc, userConfig);
        commandConfig(evmlc, userConfig);
        commandTest(evmlc, userConfig);

        // manual processing of interactive mode
        if (process.argv[2] === 'interactive' || process.argv[2] === 'i') {

            // set global interactive variable so all commands inherit interactive mode
            interactive = true;

            // show interactive console
            evmlc.delimiter('evmlc$').show();

        } else {

            // parse non-interactive command
            evmlc.parse(process.argv);

        }
    })
    .catch(err => error(err));