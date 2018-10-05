"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ASCIITable = require("ascii-table");
const JSONBig = require("json-bigint");
const inquirer = require("inquirer");
const evmlc_1 = require("../evmlc");
const functions_1 = require("../utils/functions");
/**
 * Should return a Vorpal command instance used for getting an account.
 *
 * This function should return a Vorpal command which should get an account
 * from the `/account/<address>` endpoint and parse it into an ASCII table
 * with --formatted flag or output raw JSON.
 *
 * @param {Vorpal} evmlc - The command line object.
 * @param {Object} config - A JSON of the TOML config file.
 * @returns Vorpal Command instance
 */
function commandAccountsGet(evmlc, config) {
    return evmlc.command('accounts get [address]').alias('a g')
        .option('-f, --formatted', 'format output')
        .option('-i, --interactive', 'use interactive mode')
        .types({
        string: ['_']
    })
        .action((args) => {
        return new Promise(resolve => {
            // connect to API endpoints
            evmlc_1.connect(config)
                .then((node) => {
                let handleAccountGet = () => {
                    // request JSON from 'account/<address>'
                    node.api.getAccount(args.address).then((a) => {
                        let counter = 0;
                        // blank ASCII table
                        let accountsTable = new ASCIITable();
                        let formatted = args.options.formatted || false;
                        let account = JSONBig.parse(a);
                        // add account details to ASCII table
                        accountsTable
                            .setHeading('#', 'Account Address', 'Balance', 'Nonce')
                            .addRow(counter, account.address, account.balance, account.nonce);
                        formatted ? functions_1.info(accountsTable.toString()) : functions_1.info(a);
                        resolve();
                    });
                };
                let i = args.options.interactive || evmlc_1.interactive;
                if (args.address) {
                    // address provided
                    handleAccountGet();
                }
                else if (i) {
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
                    return new Promise(resolve => {
                        functions_1.error('Provide an address. Usage: accounts get <address>');
                        resolve();
                    });
                }
            })
                .catch(err => functions_1.error(err));
        });
    })
        .description('Get an account.');
}
exports.default = commandAccountsGet;
;
