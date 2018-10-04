"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const JSONBig = require("json-bigint");
const path = require("path");
const ASCIITable = require("ascii-table");
const evmlc_1 = require("../evmlc");
const functions_1 = require("../utils/functions");
const index_1 = require("../../../index");

/**
 * Should return a Vorpal command instance used for listing all account.
 *
 * This function should return a Vorpal command which should get all accounts
 * from the `/accounts` endpoint and parse them into an ASCII table.
 *
 * @param {Vorpal} evmlc - The command line object.
 * @param {Object} config - A JSON of the TOML config file.
 * @returns Vorpal Command instance
 */
function commandAccountsList(evmlc, config) {
    return evmlc.command('accounts list').alias('a l')
        .option('-f, --formatted', 'format output')
        .description('List all accounts.')
        .action((args) => {
            // connect to node
            return evmlc_1.connect().then(() => {
                return new Promise(resolve => {
                    let accounts = [];
                    let formatted = args.options.formatted || false;
                    let promises = [];
                    let getPassword = (path) => {
                        if (path) {
                            return fs.readFileSync(path, 'utf8');
                        }
                        else {
                            return undefined;
                        }
                    };
                    // get list of all files in local keystore
                    let keyStoreFiles = fs.readdirSync(config.storage.keystore);
                    // decrypt account and populate balance
                    keyStoreFiles.forEach((file) => {
                        let keystoreFile = path.join(config.storage.keystore, file);
                        let v3JSONKeyStore = JSONBig.parse(fs.readFileSync(keystoreFile, 'utf8'));
                        let decryptedAccount = index_1.Account.decrypt(v3JSONKeyStore, getPassword(config.storage.password));
                        promises.push(evmlc_1.node.api.getAccount(decryptedAccount.address).then((a) => {
                            let {address, balance, nonce} = JSONBig.parse(a);
                            decryptedAccount.balance = balance;
                            decryptedAccount.nonce = nonce;
                            accounts.push(decryptedAccount);
                        }));
                    });
                    // once all promises have resolved
                    Promise.all(promises).then(() => {
                        let counter = 0;
                        let table = new ASCIITable()
                            .setHeading('#', 'Account Address', 'Balance', 'Nonce');
                        if (formatted) {
                            //formatted accounts list
                            accounts.forEach((account) => {
                                counter++;
                                table.addRow(counter, account.address, account.balance, account.nonce);
                            });
                            functions_1.info(table.toString());
                        }
                        else {
                            // raw accounts list
                            functions_1.success(JSONBig.stringify(accounts));
                        }
                        resolve();
                    });
                });
            });
        });
}
exports.default = commandAccountsList;
;
