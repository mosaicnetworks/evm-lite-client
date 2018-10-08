#!/usr/bin/env node

import * as tomlify from 'tomlify-j0.4'
import * as toml from 'toml';
import * as fs from 'fs';
import * as path from "path";
import * as Vorpal from "vorpal";
import * as mkdir from 'mkdirp';

import {error, isEquivalentObjects, warning} from "./utils/functions";

import {Controller} from '../../lib';

import commandAccountsCreate from './commands/AccountsCreate';
import commandAccountsList from './commands/AccountsList';
import commandAccountsGet from './commands/AccountsGet';
import commandGlobals from "./commands/Globals";
import commandTransfer from "./commands/Transfer";
import commandConfig from "./commands/Config";
import commandInteractive from "./commands/Interactive";
import commandTest from "./commands/Test";


// global interactive mode
export let interactive: boolean = false;

// paths
let evmlcDir: string = path.join(require('os').homedir(), '.evmlc');
let configDir: string = path.join(evmlcDir, 'config');
let configFilePath: string = path.join(configDir, 'evmlc.toml');

// connection to node
// when in interactive mode this is resolved instead
// of connecting multiple times to improve console speed
let node: Controller = null;

// default config layout
let defaultConfig = (): any => {
    return {
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
    }
};


/**
 * Should update config file and set default config variable.
 *
 * @param {T} config - Config object to update file to.
 * @returns void
 */
export function updateToConfigFile<T>(config: T): void {
    writeToConfigFile(config)
        .then((writtenConfig: T) => {
            defaultConfig = () => {
                return writtenConfig;
            };
        });
}


/**
 * Should attempt to connect to node with the config connection parameters
 * then try and get accounts to make sure the connection is valid then
 * returns a promise which resolves the respective Controller object.
 *
 * @param {{}} config - The config object
 * @returns Promise<Controller>
 */
export const connect = (config: any): Promise<Controller> => {
    return new Promise<Controller>((resolve, reject) => {
        if (!node) {
            node = new Controller(config.connection.host, config.connection.port || 8080);

            node.api.getAccounts().then(() => {
                resolve(node);
            })
                .catch((err) => {
                    node = null;
                    warning(err);
                    reject();
                });
        } else {
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
function writeToConfigFile<T>(content: T): Promise<T> {

    let oldConfig = defaultConfig();

    if (fs.existsSync(configFilePath)) {
        oldConfig = toml.parse(fs.readFileSync(configFilePath, 'utf8'));
    }

    // currently only supports {} to TOML
    let tomlified = tomlify.toToml(content, {spaces: 2});

    return new Promise<T>((resolve) => {
        if (!fs.existsSync(evmlcDir)) {
            mkdir.mkdirp(evmlcDir);
        }

        if (!fs.existsSync(configDir)) {
            mkdir.mkdirp(configDir);
        }

        if (!fs.existsSync(defaultConfig().storage.keystore)) {
            mkdir.mkdirp(defaultConfig().storage.keystore);
        }

        if (!fs.existsSync(defaultConfig().storage.password)) {
            fs.writeFileSync(defaultConfig().storage.password, 'supersecurepassword');
        }

        if (!isEquivalentObjects(content, oldConfig)) {
            fs.writeFileSync(configFilePath, tomlified);
        } else {
            warning('No changes in configuration detected.')
        }

        resolve(content);
    })

}


/**
 * Should read from the config file and resolve a promise with an object
 * representing the file.
 *
 * @returns Promise<{}>
 */
const readConfigFile = (): Promise<{}> => {
    return new Promise<{}>((resolve) => {
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
const createOrReadConfigFile = (): Promise<{}> => {
    return new Promise<{}>(resolve => {
        if (fs.existsSync(configFilePath)) {
            console.log('reading config file');
            readConfigFile()
                .then((config) => {
                    resolve(config);
                })
                .catch(err => error(err));
        } else {
            resolve(defaultConfig());
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
        commandAccountsCreate(evmlc, config);
        commandAccountsList(evmlc, config);
        commandAccountsGet(evmlc, config);
        commandInteractive(evmlc, config);
        commandGlobals(evmlc, config);
        commandTransfer(evmlc, config);
        commandConfig(evmlc, config);
        commandTest(evmlc, config);

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
    .catch(() => error(`Error reading config file.`));

