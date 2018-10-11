import * as Vorpal from "vorpal";
import * as JSONBig from 'json-bigint';

import {BaseAccount, error, success} from "../utils/globals";

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
                    let accounts: BaseAccount[];

                    if (!remote) {
                        let accs = await session.keystore.decrypt((connection));

                        accounts = accs.map((account) => {
                            return account.toBaseAccount()
                        });
                    } else {
                        accounts = await connection.getRemoteAccounts();
                    }

                    (formatted) ? console.table(accounts) : success(JSONBig.stringify(accounts));
                } catch (err) {
                    (typeof err === 'object') ? console.log(err) : error(err);
                }
                resolve();
            });
        });

};