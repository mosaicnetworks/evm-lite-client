"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const mkdir = require("mkdirp");
const Chalk = require("chalk");
const JSONBig = require("json-bigint");
const evmlc_1 = require("../evmlc");
const lib_1 = require("../../../lib");
const Config_1 = require("../classes/Config");
const l = console.log;
const chalk = Chalk.default;
// logging functions
exports.success = (message) => l(chalk.green(message));
exports.warning = (message) => l(chalk.yellow(message));
exports.error = (message) => l(chalk.red(message));
exports.info = (message) => l(chalk.blue(message));
// global root evmlc directory
exports.evmlcDir = path.join(require('os').homedir(), '.evmlc');
exports.rootConfigDir = path.join(exports.evmlcDir, 'config');
exports.defaultConfigDir = path.join(exports.evmlcDir, 'config');
exports.defaultConfigFilePath = path.join(exports.defaultConfigDir, 'config.toml');
// connection to node
// when in interactive mode this is resolved instead
// of connecting multiple times to improve console speed
exports.node = undefined;
// read password file
// create directory if it does not exists
exports.getPassword = (passwordPath) => {
    if (passwordPath) {
        let list = passwordPath.split('/');
        list.pop();
        let pwdDirectory = list.join('/');
        if (!fs.existsSync(pwdDirectory)) {
            mkdir.mkdirp(pwdDirectory);
        }
        if (!fs.existsSync(passwordPath)) {
            let password = 'supersecurepassword';
            fs.writeFileSync(passwordPath, password);
            return password;
        }
        return fs.readFileSync(passwordPath, 'utf8');
    }
    return undefined;
};
// decrypts local accounts in keystore with provided password file
// gets balance and nonce from node
// connection required
exports.decryptLocalAccounts = (node, keystorePath, passwordPath) => {
    let accounts = [];
    let promises = [];
    let keyStoreFiles = fs.readdirSync(keystorePath);
    keyStoreFiles.forEach((file) => {
        if (!file.startsWith('.')) {
            let keystoreFile = path.join(keystorePath, file);
            let password = exports.getPassword(passwordPath);
            let v3JSONKeyStore = JSONBig.parse(fs.readFileSync(keystoreFile, 'utf8'));
            let decryptedAccount = lib_1.Account.decrypt(v3JSONKeyStore, password);
            promises.push(node.api.getAccount(decryptedAccount.address).then((a) => {
                let account = JSONBig.parse(a);
                decryptedAccount.balance = account.balance;
                if (typeof account.balance === 'object')
                    decryptedAccount.balance = account.balance.toFormat(0);
                decryptedAccount.nonce = account.nonce;
                accounts.push(decryptedAccount);
            }));
        }
    });
    return Promise.all(promises)
        .then(() => {
        return new Promise(resolve => {
            resolve(accounts);
        });
    })
        .catch(() => {
        return new Promise(resolve => {
            resolve([]);
        });
    });
};
// checks if two objects are equivalent
// recursion for objects within objects
exports.isEquivalentObjects = (objectA, objectB) => {
    // console.log(objectA);
    // console.log(objectB);
    let aProps = Object.getOwnPropertyNames(objectA);
    let bProps = Object.getOwnPropertyNames(objectB);
    // console.log(aProps);
    // console.log(bProps);
    if (aProps.length != bProps.length) {
        // console.log(`Length: ${aProps.length} !== ${bProps.length}`);
        return false;
    }
    for (let i = 0; i < aProps.length; i++) {
        let propName = aProps[i];
        // console.log(`${objectA[propName]}, ${objectB[propName]}`);
        if (typeof objectA[propName] === 'object' && typeof objectB[propName] === 'object') {
            if (!exports.isEquivalentObjects(objectA[propName], objectB[propName])) {
                return false;
            }
        }
        else if (objectA[propName] !== objectB[propName]) {
            // console.log(`${objectA[propName]} !== ${objectB[propName]}`);
            return false;
        }
    }
    return true;
};
/**
 * Should attempt to connect to node with the config connection parameters
 * then try and get accounts to make sure the connection is valid then
 * returns a promise which resolves the respective Controller object.
 *
 * @param {Config} config - The config object
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
                exports.warning(err);
                reject();
            });
        }
        else {
            resolve(exports.node);
        }
    });
};
// initialise root cli directory
exports.initDirectories = () => {
    return new Promise(resolve => {
        // .evmlc
        if (!fs.existsSync(exports.evmlcDir)) {
            mkdir.mkdirp(exports.evmlcDir);
        }
        resolve();
    });
};
// get config
// returns an instance or interactive instance
exports.getConfig = (optionalPath) => {
    return evmlc_1.interactiveConfig || new Config_1.default(optionalPath || exports.defaultConfigFilePath);
};
// return if interactive or not
exports.getInteractive = (optionalInteractive) => {
    return optionalInteractive || evmlc_1.interactive;
};
