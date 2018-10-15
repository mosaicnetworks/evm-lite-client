import * as Vorpal from "vorpal";
import * as JSONBig from 'json-bigint';
import * as ASCIITable from 'ascii-table';

import Globals, {BaseAccount} from "../utils/Globals";
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
                    let accounts: BaseAccount[] = [];
                    let accountsTable = new ASCIITable().setHeading('#', 'Address', 'Balance', 'Nonce');

                    if (!remote) {
                        accounts = (await session.keystore.decrypt(connection)).map(account => account.toBaseAccount());
                    } else {
                        accounts = await connection.getRemoteAccounts();
                    }

                    if (formatted) {
                        let counter = 1;
                        accounts.forEach(account => {
                            accountsTable.addRow(counter, account.address, account.balance, account.nonce);
                            counter++;
                        });
                    }

                    if (accounts.length) {
                        Globals.success((formatted) ? accountsTable.toString() : JSONBig.stringify(accounts));
                    } else {
                        Globals.warning('No accounts.');
                    }
                } catch (err) {
                    (typeof err === 'object') ? console.log(err) : Globals.error(err);
                }
                resolve();
            });
        });

};