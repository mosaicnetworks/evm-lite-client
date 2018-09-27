"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
const fs = require("fs");
const functions_1 = require("../utils/functions");
const index_1 = require("../../../index");
const ASCIITable = require("ascii-table");
const JSONBig = require("json-bigint");
function commandAccountsCreate(evmlc, config) {
    return evmlc.command('accounts create').alias('a c')
        .description('Create an account.')
        .option('-l, --local', 'create account locally')
        .option('-p, --password <password>', 'provide password to encrypt password locally')
        .types({
            string: ['p', 'password']
        })
        .action((args) => {
            return new Promise(resolve => {
                let account = index_1.Account.create();
                let getPassword = () => {
                    return fs.readFileSync(config.storage.password, 'utf8');
                };
                if (!args.options.local && args.options.password) {
                    // provided password but no local flag
                    functions_1.error('Cannot use custom password without local flag.');
                    resolve();
                }
                else if (args.options.local && !args.options.password) {
                    // provided local flag but no password
                    functions_1.error('Provide password to encrypt locally with -p, --password');
                    resolve();
                }
                else if (!args.options.local && !args.options.password) {
                    // create account remotely
                    let encryptedAccount = account.encrypt(getPassword());
                    let localPath = `${config.storage.keystore}/${account.address}`;
                    let stringEncryptedAccount = JSONBig.stringify(encryptedAccount);
                    let newAccountTable = new ASCIITable('New Account')
                        .addRow('Address', account.address)
                        .addRow('Private Key', account.privateKey);
                    fs.writeFileSync(localPath, stringEncryptedAccount);
                    functions_1.success(newAccountTable.toString());
                    resolve();
                }
            });
        });
}
exports.default = commandAccountsCreate;
;
