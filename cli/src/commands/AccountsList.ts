import * as Vorpal from "vorpal";
import * as JSONBig from 'json-bigint';
import * as ASCIITable from 'ascii-table';

import {BaseAccount, error, info, success} from "../utils/globals";

import {Account} from '../../../lib';

import Session from "../classes/Session";


export default function commandAccountsList(evmlc: Vorpal, session: Session) {

    let description =
        'List all accounts in the local keystore directory provided by the configuration file. This command will ' +
        'also get a balance and nonce for all the accounts from the node if a valid connection is established.';

    return evmlc.command('accounts list').alias('a l')
        .description(description)
        .option('-f, --formatted', 'format output')
        .option('-r, --remote', 'list remote accounts')
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>(resolve => {
                session.connect()
                    .then((connection) => {

                        let formatted: boolean = args.options.formatted || false;
                        let remote = args.options.remote || false;

                        if (!remote) {
                            session.keystore.decrypt(connection)
                                .then((accounts) => {
                                    let counter = 0;
                                    let table = new ASCIITable()
                                        .setHeading('#', 'Account Address', 'Balance', 'Nonce');

                                    if (formatted) {
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
                                .catch((err) => error(err));
                        } else {
                            connection.api.getAccounts()
                                .then((a: string) => {
                                    let accounts: BaseAccount[] = JSONBig.parse(a).accounts;
                                    let counter = 0;
                                    let table = new ASCIITable()
                                        .setHeading('#', 'Account Address', 'Balance', 'Nonce');

                                    if (formatted) {
                                        accounts.forEach((account) => {
                                            let balance = account.balance;

                                            if (typeof balance === 'object')
                                                balance = account.balance.toFormat(0);

                                            counter++;
                                            table.addRow(counter, account.address, balance, account.nonce)
                                        });

                                        info(table.toString());
                                    } else {
                                        success(a);
                                    }

                                    resolve();
                                })
                                .catch(err => error(err))
                        }
                    })
                    .catch(err => error(err));

            });
        });

};