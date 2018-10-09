"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JSONBig = require("json-bigint");
const ASCIITable = require("ascii-table");
const globals_1 = require("../utils/globals");
/**
 * Should return a Vorpal command instance used for listing all account.
 *
 * This function should return a Vorpal command which should get all accounts
 * from the local keystore directory and parse them into an ASCII table with the
 * --formatted flag else outputs raw JSON.
 *
 * @param {Vorpal} evmlc - The command line object.
 * @returns Vorpal Command instance
 */
function commandAccountsList(evmlc) {
    return evmlc.command('accounts list').alias('a l')
        .option('-f, --formatted', 'format output')
        .option('-c, --config <path>', 'set config file path')
        .description('List all accounts.')
        .action((args) => {
        return new Promise(resolve => {
            let config = globals_1.getConfig(args.options.config);
            // connect to node
            globals_1.connect(config)
                .then((node) => {
                let formatted = args.options.formatted || false;
                // get all local accounts
                    globals_1.decryptLocalAccounts(node, config.data.storage.keystore, config.data.storage.password)
                    .then((accounts) => {
                    let counter = 0;
                    let table = new ASCIITable()
                        .setHeading('#', 'Account Address', 'Balance', 'Nonce');
                    if (formatted) {
                        //formatted accounts list
                        accounts.forEach((account) => {
                            counter++;
                            table.addRow(counter, account.address, account.balance, account.nonce);
                        });
                        globals_1.info(table.toString());
                    }
                    else {
                        let parsedAccounts = [];
                        // parse each account into BaseAccount
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
            })
                .catch(err => globals_1.error(err));
        });
    });
}
exports.default = commandAccountsList;
;
