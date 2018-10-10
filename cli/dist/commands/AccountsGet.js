"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ASCIITable = require("ascii-table");
const JSONBig = require("json-bigint");
const inquirer = require("inquirer");
const globals_1 = require("../utils/globals");
function commandAccountsGet(evmlc, session) {
    let description = 'Gets account balance and nonce from a node with a valid connection.';
    return evmlc.command('accounts get [address]').alias('a g')
        .description(description)
        .option('-f, --formatted', 'format output')
        .option('-i, --interactive', 'use interactive mode')
        .types({
        string: ['_']
    })
        .action((args) => {
        return new Promise(resolve => {
            let interactive = args.options.interactive || session.interactive;
            // connect to API endpoints
            session.connect()
                .then((connection) => {
                let handleAccountGet = () => {
                    // request JSON from 'account/<address>'
                    connection.api.getAccount(args.address).then((a) => {
                        let counter = 0;
                        // blank ASCII table
                        let accountsTable = new ASCIITable();
                        let formatted = args.options.formatted || false;
                        let account = JSONBig.parse(a);
                        let balance = account.balance;
                        if (typeof balance === 'object')
                            balance = account.balance.toFormat(0);
                        // add account details to ASCII table
                        accountsTable
                            .setHeading('#', 'Account Address', 'Balance', 'Nonce')
                            .addRow(counter, account.address, balance, account.nonce);
                        formatted ? globals_1.info(accountsTable.toString()) : globals_1.info(a);
                        resolve();
                    });
                };
                if (args.address) {
                    // address provided
                    handleAccountGet();
                }
                else if (interactive) {
                    // no address but interactive
                    let questions = [
                        {
                            name: 'address',
                            type: 'input',
                            required: true,
                            message: 'Address: '
                        }
                    ];
                    inquirer.prompt(questions)
                        .then(answers => {
                        args.address = answers.address;
                    })
                        .then(() => {
                        handleAccountGet();
                    });
                }
                else {
                    // if -a or --address are not provided
                    globals_1.error('Provide an address. Usage: accounts get <address>');
                    resolve();
                }
            })
                .catch(err => globals_1.error(err));
        });
    });
}
exports.default = commandAccountsGet;
;
