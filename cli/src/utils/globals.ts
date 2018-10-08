import * as path from "path";
import * as fs from "fs";
import * as mkdir from 'mkdirp';

import {warning} from "./functions";

import {Controller} from "../../../lib";

import UserConfig from "../classes/UserConfig";


// global root evmlc directory
export const evmlcDir: string = path.join(require('os').homedir(), '.evmlc');
export const rootConfigDir = path.join(evmlcDir, 'config');
export const rootConfigFilePath = path.join(rootConfigDir, 'evmlc.toml');

// connection to node
// when in interactive mode this is resolved instead
// of connecting multiple times to improve console speed
export let node: Controller = undefined;


/**
 * Should attempt to connect to node with the config connection parameters
 * then try and get accounts to make sure the connection is valid then
 * returns a promise which resolves the respective Controller object.
 *
 * @param {UserConfig} config - The config object
 * @returns Promise<Controller>
 */
export const connect = (config: UserConfig): Promise<Controller> => {
    return new Promise<Controller>((resolve, reject) => {
        if (!node) {
            node = new Controller(config.data.connection.host, config.data.connection.port || 8080);

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


export const createDefaultDirectories = (): Promise<void> => {

    return new Promise<void>(resolve => {

        // .evmlc
        // .evmlc/config
        if (!fs.existsSync(rootConfigDir)) {
            mkdir.mkdirp(rootConfigDir);
        }

        resolve();

    });

};