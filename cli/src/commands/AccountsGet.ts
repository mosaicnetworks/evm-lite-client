import * as Vorpal from "vorpal";
import * as ASCIITable from 'ascii-table';
import * as JSONBig from 'json-bigint';
import * as inquirer from 'inquirer';

import {BaseAccount, error, info} from "../utils/globals";

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
                            connection.getRemoteAccount(args.address)
                                .then((account: BaseAccount) => {
                                    let counter: number = 0;
                                    let accountsTable: ASCIITable = new ASCIITable();
                                    let formatted = args.options.formatted || false;

                                    accountsTable
                                        .setHeading('#', 'Account Address', 'Balance', 'Nonce')
                                        .addRow(counter, account.address, account.balance, account.nonce);

                                    formatted ? info(accountsTable.toString()) : info(JSONBig.stringify(account));
                                    resolve();
                                })
                                .catch(err => error(err));
                        };

                        if (args.address) {
                            handleAccountGet();
                        } else if (interactive) {
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
                            error('Provide an address. Usage: accounts get <address>');
                            resolve();
                        }
                    })
                    .catch(err => error(err));

            });
        });

};