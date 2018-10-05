import * as Vorpal from "vorpal";
import * as ASCIITable from 'ascii-table';
import * as JSONBig from 'json-bigint';
import * as inquirer from 'inquirer';

import {connect, interactive} from "../evmlc";
import {error, info} from "../utils/functions";


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
export default function commandAccountsGet(evmlc: Vorpal, config) {

    return evmlc.command('accounts get [address]').alias('a g')
        .option('-f, --formatted', 'format output')
        .option('-i, --interactive', 'use interactive mode')
        .types({
            string: ['_']
        })
        .action((args: Vorpal.Args): Promise<void> => {

            return new Promise<void>(resolve => {

                // connect to API endpoints
                connect(config)
                    .then((node) => {

                        let handleAccountGet = (): void => {

                            // request JSON from 'account/<address>'
                            node.api.getAccount(args.address).then((a: string) => {

                                let counter: number = 0;

                                // blank ASCII table
                                let accountsTable: ASCIITable = new ASCIITable();

                                let formatted = args.options.formatted || false;

                                let account: {
                                    address: string,
                                    balance: number,
                                    nonce: number
                                } = JSONBig.parse(a);

                                // add account details to ASCII table
                                accountsTable
                                    .setHeading('#', 'Account Address', 'Balance', 'Nonce')
                                    .addRow(counter, account.address, account.balance, account.nonce);

                                formatted ? info(accountsTable.toString()) : info(a);

                                resolve();
                            });

                        };

                        let i = args.options.interactive || interactive;

                        if (args.address) {

                            // address provided
                            handleAccountGet();

                        } else if (i) {

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

                        } else {

                            // if -a or --address are not provided
                            return new Promise<void>(resolve => {

                                error('Provide an address. Usage: accounts get <address>');
                                resolve();

                            });

                        }

                    })
                    .catch(err => error(err));

            });
        })
        .description('Get an account.');

};