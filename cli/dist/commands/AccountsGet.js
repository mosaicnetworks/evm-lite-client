"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ASCIITable = require("ascii-table");
const JSONBig = require("json-bigint");
const inquirer = require("inquirer");
const globals_1 = require("../utils/globals");
/**
 * Should return a Vorpal command instance used for getting an account.
 *
 * This function should return a Vorpal command which should get an account
 * from the `/account/<address>` endpoint and parse it into an ASCII table
 * with --formatted flag or output raw JSON.
 *
 * @param {Vorpal} evmlc - The command line object.
 * @returns Vorpal Command instance
 */
function commandAccountsGet(evmlc) {
    let description = `Gets account balance and nonce from a node with a valid connection.`;
    return evmlc.command('accounts get [address]').alias('a g')
        .description(description)
        .option('-f, --formatted', 'format output')
        .option('-c, --config <path>', 'set config file path')
        .option('-i, --interactive', 'use interactive mode')
        .types({
        string: ['_']
    })
        .action((args) => {
        return new Promise(resolve => {
            let i = globals_1.getInteractive(args.options.interactive);
            let config = globals_1.getConfig(args.options.config);
            // connect to API endpoints
            globals_1.connect(config)
                .then((node) => {
                let handleAccountGet = () => {
                    // request JSON from 'account/<address>'
                    node.api.getAccount(args.address).then((a) => {
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
                        globals_1.error('Provide an address. Usage: accounts get <address>');
                        resolve();
                    });
                }
            })
                .catch(err => globals_1.error(err));
        });
    });
}
exports.default = commandAccountsGet;
;
