import * as Vorpal from "vorpal";
import * as JSONBig from 'json-bigint';
import * as ASCIITable from 'ascii-table';

import {connect} from "../evmlc";
import {BaseAccount, decryptLocalAccounts, info, success} from "../utils/functions";

import {Account} from '../../../lib';


/**
 * Should return a Vorpal command instance used for listing all account.
 *
 * This function should return a Vorpal command which should get all accounts
 * from the `/accounts` endpoint and parse them into an ASCII table.
 *
 * @param {Vorpal} evmlc - The command line object.
 * @param {Object} config - A JSON of the TOML config file.
 * @returns Vorpal Command instance
 */
export default function commandAccountsList(evmlc: Vorpal, config) {

    return evmlc.command('accounts list').alias('a l')
        .option('-f, --formatted', 'format output')
        .description('List all accounts.')
        .action((args: Vorpal.Args): Promise<void> => {

            return new Promise<void>(resolve => {

                // connect to node
                connect().then((node) => {

                    let formatted: boolean = args.options.formatted || false;

                    // once all promises have resolved
                    decryptLocalAccounts(node, config.storage.keystore, config.storage.password)
                        .then((accounts) => {
                            let counter = 0;
                            let table = new ASCIITable()
                                .setHeading('#', 'Account Address', 'Balance', 'Nonce');

                            if (formatted) {

                                //formatted accounts list
                                accounts.forEach((account: Account) => {
                                    counter++;
                                    table.addRow(counter, account.address, account.balance, account.nonce)
                                });

                                info(table.toString());

                            } else {

                                let parsedAccounts: BaseAccount[] = [];

                                accounts.forEach(account => {
                                    parsedAccounts.push({
                                        address: account.address,
                                        balance: account.balance,
                                        nonce: account.nonce
                                    })
                                });

                                success(JSONBig.stringify(parsedAccounts));

                            }

                            resolve();
                        })
                        .catch((err) => {
                            console.log(err);
                        })


                });

            });

        });

};