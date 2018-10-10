"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JSONBig = require("json-bigint");
const ASCIITable = require("ascii-table");
const globals_1 = require("../utils/globals");
function commandAccountsList(evmlc, session) {
    let description = 'List all accounts in the local keystore directory provided by the configuration file. This command will ' +
        'also get a balance and nonce for all the accounts from the node if a valid connection is established.';
    return evmlc.command('accounts list').alias('a l')
        .description(description)
        .option('-f, --formatted', 'format output')
        .option('-r, --remote', 'list remote accounts')
        .action((args) => {
        return new Promise(resolve => {
            session.connect()
                .then((connection) => {
                let formatted = args.options.formatted || false;
                let remote = args.options.remote || false;
                if (!remote) {
                    session.keystore.decrypt(connection)
                        .then((accounts) => {
                        let counter = 0;
                        let table = new ASCIITable()
                            .setHeading('#', 'Account Address', 'Balance', 'Nonce');
                        if (formatted) {
                            accounts.forEach((account) => {
                                counter++;
                                table.addRow(counter, account.address, account.balance, account.nonce);
                            });
                            globals_1.info(table.toString());
                        }
                        else {
                            let parsedAccounts = [];
                            accounts.forEach(account => {
                                parsedAccounts.push({
                                    address: account.address,
                                    balance: account.balance,
                                    nonce: account.nonce
                                });
                            });
                            globals_1.success(JSONBig.stringify(parsedAccounts));
                        }
                        resolve();
                    })
                        .catch((err) => globals_1.error(err));
                }
                else {
                    connection.api.getAccounts()
                        .then((a) => {
                        let accounts = JSONBig.parse(a).accounts;
                        let counter = 0;
                        let table = new ASCIITable()
                            .setHeading('#', 'Account Address', 'Balance', 'Nonce');
                        if (formatted) {
                            accounts.forEach((account) => {
                                let balance = account.balance;
                                if (typeof balance === 'object')
                                    balance = account.balance.toFormat(0);
                                counter++;
                                table.addRow(counter, account.address, balance, account.nonce);
                            });
                            globals_1.info(table.toString());
                        }
                        else {
                            globals_1.success(a);
                        }
                    })
                        .catch(err => globals_1.error(err));
                }
            })
                .catch(err => globals_1.error(err));
        });
    });
}
exports.default = commandAccountsList;
;
