"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Chalk = require("chalk");
const fs = require("fs");
const lib_1 = require("../../../lib");
const JSONBig = require("json-bigint");
const path = require("path");
const l = console.log;
const chalk = Chalk.default;
exports.getPassword = (passwordPath) => {
    if (passwordPath) {
        return fs.readFileSync(passwordPath, 'utf8');
    }
    else {
        return undefined;
    }
};
exports.success = (message) => l(chalk.green(message));
exports.warning = (message) => l(chalk.yellow(message));
exports.error = (message) => l(chalk.red(message));
exports.info = (message) => l(chalk.blue(message));
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
        .catch(err => {
            exports.error(err);
            return new Promise(resolve => {
                resolve([]);
            });
        });
};
