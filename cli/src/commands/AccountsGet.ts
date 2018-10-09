import * as Vorpal from "vorpal";
import * as ASCIITable from 'ascii-table';
import * as JSONBig from 'json-bigint';
import * as inquirer from 'inquirer';

import {connect, error, getConfig, getInteractive, info} from "../utils/globals";


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
export default function commandAccountsGet(evmlc: Vorpal) {

    let description =
        `Gets account balance and nonce from a node with a valid connection.`;

    return evmlc.command('accounts get [address]').alias('a g')
        .description(description)
        .option('-f, --formatted', 'format output')
        .option('-c, --config <path>', 'set config file path')
        .option('-i, --interactive', 'use interactive mode')
        .types({
            string: ['_']
        })
        .action((args: Vorpal.Args): Promise<void> => {

            return new Promise<void>(resolve => {

                let i = getInteractive(args.options.interactive);
                let config = getConfig(args.options.config);

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
                                    balance: any,
                                    nonce: number
                                } = JSONBig.parse(a);

                                let balance = account.balance;

                                if (typeof balance === 'object')
                                    balance = account.balance.toFormat(0);


                                // add account details to ASCII table
                                accountsTable
                                    .setHeading('#', 'Account Address', 'Balance', 'Nonce')
                                    .addRow(counter, account.address, balance, account.nonce);

                                formatted ? info(accountsTable.toString()) : info(a);

                                resolve();
                            });

                        };

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
        });

};