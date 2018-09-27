"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
const ASCIITable = require("ascii-table");
const JSONBig = require("json-bigint");
const evmlc_1 = require("../evmlc");
const functions_1 = require("../utils/functions");

function commandAccountsCreate(evmlc, config) {
    return evmlc.command('accounts list').alias('a l')
        .description('list all accounts')
        .action(() => {
            return evmlc_1.node.api.getAccounts().then((accounts) => {
                let counter = 0;
                let accountsTable = new ASCIITable();
                evmlc_1.node.accounts = JSONBig.parse(accounts).accounts;
                if (evmlc_1.node.accounts) {
                    accountsTable
                        .setHeading('', 'Account Address', 'Balance', 'Nonce');
                    evmlc_1.node.accounts.map((account) => {
                        counter++;
                        accountsTable.addRow(counter, account.address, account.balance, account.nonce);
                    });
                    functions_1.info(accountsTable.toString());
                }
                else {
                    functions_1.warning('No accounts.');
                }
            });
        });
}

exports.default = commandAccountsCreate;
;
