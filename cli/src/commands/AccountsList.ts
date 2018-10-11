import * as Vorpal from "vorpal";
import * as JSONBig from 'json-bigint';
import * as ASCIITable from 'ascii-table';

import {BaseAccount, error, success} from "../utils/globals";

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
            return new Promise<void>(async (resolve) => {
                try {
                    let connection = await session.connect();
                    let formatted: boolean = args.options.formatted || false;
                    let remote = args.options.remote || false;

                    if (!remote) {
                        let accounts = await session.keystore.decrypt((connection));
                        let counter = 0;
                        let table = new ASCIITable().setHeading('#', 'Account Address', 'Balance', 'Nonce');

                        if (formatted) {
                            accounts.forEach((account: Account) => {
                                counter++;
                                table.addRow(counter, account.address, account.balance, account.nonce)
                            });
                            success(table.toString());
                        } else {
                            let parsedAccounts: BaseAccount[] = accounts.map(account => {
                                return account.toBaseAccount();
                            });
                            success(JSONBig.stringify(parsedAccounts));
                        }
                    } else {
                        let accounts: BaseAccount[] = await connection.getRemoteAccounts();
                        let counter = 0;
                        let table = new ASCIITable().setHeading('#', 'Account Address', 'Balance', 'Nonce');

                        if (formatted) {
                            accounts.forEach((account) => {
                                counter++;
                                table.addRow(counter, account.address, account.balance, account.nonce)
                            });
                            success(table.toString());
                        } else {
                            success(JSONBig.stringify(accounts));
                        }
                    }
                } catch (err) {
                    (typeof err === 'object') ? console.log(err) : error(err);
                }
                resolve();
            });
        });

};