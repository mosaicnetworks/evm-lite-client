import * as Vorpal from "vorpal";
import * as JSONBig from 'json-bigint';
import * as ASCIITable from 'ascii-table';

import {BaseAccount, connect, decryptLocalAccounts, error, getConfig, info, success} from "../utils/globals";

import {Account} from '../../../lib';


/**
 * Should return a Vorpal command instance used for listing all account.
 *
 * This function should return a Vorpal command which should get all accounts
 * from the local keystore directory and parse them into an ASCII table with the
 * --formatted flag else outputs raw JSON.
 *
 * @param {Vorpal} evmlc - The command line object.
 * @returns Vorpal Command instance
 */
export default function commandAccountsList(evmlc: Vorpal) {

    let description =
        `List all accounts in the local keystore directory provided by the configuration file. This command will also
        get a balance and nonce for all the accounts from the node if a valid connection is established.`;

    return evmlc.command('accounts list').alias('a l')
        .description(description)
        .option('-f, --formatted', 'format output')
        .option('-c, --config <path>', 'set config file path')
        .action((args: Vorpal.Args): Promise<void> => {

            return new Promise<void>(resolve => {

                let config = getConfig(args.options.config);

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