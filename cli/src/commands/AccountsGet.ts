import * as Vorpal from "vorpal";
import * as ASCIITable from 'ascii-table';
import * as JSONBig from 'json-bigint';
import * as inquirer from 'inquirer';

import {error, info} from "../utils/globals";
import Session from "../classes/Session";


export default function commandAccountsGet(evmlc: Vorpal, session: Session) {

    let description =
        'Gets account balance and nonce from a node with a valid connection.';

    return evmlc.command('accounts get [address]').alias('a g')
        .description(description)
        .option('-f, --formatted', 'format output')
        .option('-i, --interactive', 'use interactive mode')
        .types({
            string: ['_']
        })
        .action((args: Vorpal.Args): Promise<void> => {

            return new Promise<void>(resolve => {

                let interactive = args.options.interactive || session.interactive;

                // connect to API endpoints
                session.connect()
                    .then((connection) => {

                        let handleAccountGet = (): void => {

                            // request JSON from 'account/<address>'
                            connection.api.getAccount(args.address).then((a: string) => {

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

                        } else if (interactive) {

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