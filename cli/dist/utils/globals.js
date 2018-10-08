"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const mkdir = require("mkdirp");
const functions_1 = require("./functions");
const lib_1 = require("../../../lib");
// global root evmlc directory
exports.evmlcDir = path.join(require('os').homedir(), '.evmlc');
exports.rootConfigDir = path.join(exports.evmlcDir, 'config');
exports.rootConfigFilePath = path.join(exports.rootConfigDir, 'evmlc.toml');
// connection to node
// when in interactive mode this is resolved instead
// of connecting multiple times to improve console speed
exports.node = undefined;
/**
 * Should attempt to connect to node with the config connection parameters
 * then try and get accounts to make sure the connection is valid then
 * returns a promise which resolves the respective Controller object.
 *
 * @param {UserConfig} config - The config object
 * @returns Promise<Controller>
 */
exports.connect = (config) => {
    return new Promise((resolve, reject) => {
        if (!exports.node) {
            exports.node = new lib_1.Controller(config.data.connection.host, config.data.connection.port || 8080);
            exports.node.api.getAccounts().then(() => {
                resolve(exports.node);
            })
                .catch((err) => {
                exports.node = null;
                functions_1.warning(err);
                reject();
            });
        }
        else {
            resolve(exports.node);
        }
    });
};
exports.createDefaultDirectories = () => {
    return new Promise(resolve => {
        // .evmlc
        // .evmlc/config
        if (!fs.existsSync(exports.rootConfigDir)) {
            mkdir.mkdirp(exports.rootConfigDir);
        }
        resolve();
    });
};
