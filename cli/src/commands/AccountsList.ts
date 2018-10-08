import * as Vorpal from "vorpal";
import * as JSONBig from 'json-bigint';
import * as ASCIITable from 'ascii-table';

import {BaseAccount, decryptLocalAccounts, error, info, success} from "../utils/functions";

import {Account} from '../../../lib';
import {connect} from "../utils/globals";

import UserConfig from "../classes/UserConfig";


/**
 * Should return a Vorpal command instance used for listing all account.
 *
 * This function should return a Vorpal command which should get all accounts
 * from the local keystore directory and parse them into an ASCII table with the
 * --formatted flag else outputs raw JSON.
 *
 * @param {Vorpal} evmlc - The command line object.
 * @param {UserConfig} config - A JSON of the TOML config file.
 * @returns Vorpal Command instance
 */
export default function commandAccountsList(evmlc: Vorpal, config: UserConfig) {

    return evmlc.command('accounts list').alias('a l')
        .option('-f, --formatted', 'format output')
        .description('List all accounts.')
        .action((args: Vorpal.Args): Promise<void> => {

            return new Promise<void>(resolve => {

                // connect to node
                connect(config)
                    .then((node) => {

                        let formatted: boolean = args.options.formatted || false;

                        // get all local accounts
                        decryptLocalAccounts(node, config.data.storage.keystore, config.data.storage.password)
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

                                    // parse each account into BaseAccount
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
                            .catch((err) => error(err));


                    })
                    .catch(err => error(err));

            });

        });

};