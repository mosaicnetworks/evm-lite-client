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
                    connection.getRemoteAccount(args.address)
                        .then((account) => {
                        let counter = 0;
                        let accountsTable = new ASCIITable();
                        let formatted = args.options.formatted || false;
                        accountsTable
                            .setHeading('#', 'Account Address', 'Balance', 'Nonce')
                            .addRow(counter, account.address, account.balance, account.nonce);
                        formatted ? globals_1.info(accountsTable.toString()) : globals_1.info(JSONBig.stringify(account));
                        resolve();
                    })
                        .catch(err => globals_1.error(err));
                };
                if (args.address) {
                    handleAccountGet();
                }
                else if (interactive) {
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
