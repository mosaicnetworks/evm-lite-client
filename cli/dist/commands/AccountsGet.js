"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ASCIITable = require("ascii-table");
const JSONBig = require("json-bigint");
const evmlc_1 = require("../evmlc");
const functions_1 = require("../utils/functions");
function commandAccountsGet(evmlc, config) {
    return evmlc.command('accounts get').alias('a g')
        .option('-a, --address <address>', 'Address to fetch account of.')
        .types({
        string: ['a', 'address']
    })
        .action((args) => {
        return evmlc_1.connect().then(() => {
            if (args.options.address) {
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
