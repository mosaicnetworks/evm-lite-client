"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ASCIITable = require("ascii-table");
const JSONBig = require("json-bigint");
const evmlc_1 = require("../evmlc");
const functions_1 = require("../utils/functions");

/**
 * Should return a Vorpal command instance used for getting an account.
 *
 * This function should return a Vorpal command which should get an account
 * from the `/account/<address>` endpoint and parse it into an ASCII table.
 *
 * @param {Vorpal} evmlc - The command line object.
 * @param {Object} config - A JSON of the TOML config file.
 * @returns Vorpal Command instance
 */
function commandAccountsGet(evmlc, config) {
    return evmlc.command('accounts get').alias('a g')
        .option('-a, --address <address>', 'Address to fetch account of.')
        .types({
            string: ['a', 'address']
        })
        .action((args) => {
            // connect to API endpoints
            return evmlc_1.connect().then(() => {
                if (args.options.address) {
                    // request JSON from 'account/<address>'
                    return evmlc_1.node.api.getAccount(args.options.address).then((a) => {
                        let counter = 0;
                        let accountsTable = new ASCIITable();
                        let account = JSONBig.parse(a);
                        accountsTable
                            .setHeading('#', 'Account Address', 'Balance', 'Nonce')
                            .addRow(counter, account.address, account.balance, account.nonce);
                        functions_1.info(accountsTable.toString());
                    });
                }
                else {
                    // if -a or --address are not provided
                    return new Promise(resolve => {
                        functions_1.error('Provide address to get. -a, --address');
                        resolve();
                    });
                }
            });
        })
        .description('Get an account.');
}
exports.default = commandAccountsGet;
;
