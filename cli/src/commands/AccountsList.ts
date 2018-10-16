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
        .option('-h, --host <ip>', 'override config parameter host')
        .option('-p, --port <port>', 'override config parameter port')
        .types({
            string: ['h', 'host']
        })
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>(async (resolve) => {
                let l = session.log().withCommand('accounts list');
                try {
                    let connection = await session.connect(args.options.host, args.options.port);
                    let formatted: boolean = args.options.formatted || false;
                    let remote = args.options.remote || false;
                    let accounts: BaseAccount[] = [];
                    let accountsTable = new ASCIITable().setHeading('#', 'Address', 'Balance', 'Nonce');

                    if (!remote) {
                        l.append('location', 'local');
                        accounts = (await session.keystore.decrypt(connection)).map(account => account.toBaseAccount());
                        l.append('accounts', 'decryption successful');
                    } else {
                        l.append('location', 'remote');
                        accounts = await connection.getRemoteAccounts();
                        l.append('accounts', 'request successful');
                    }

                    if (formatted) {
                        l.append('formatted', 'true');
                        let counter = 1;
                        accounts.forEach(account => {
                            accountsTable.addRow(counter, account.address, account.balance, account.nonce);
                            counter++;
                        });
                    } else {
                        l.append('formatted', 'false');
                    }

                    if (accounts.length) {
                        Globals.success((formatted) ? accountsTable.toString() : JSONBig.stringify(accounts));
                        l.append('status', 'success');
                    } else {
                        Globals.warning('No accounts.');
                        l.append('status', 'no accounts');
                    }
                } catch (err) {
                    l.append('status', 'failed');
                    if (typeof err === 'object') {
                        l.append(err.name, err.text);
                        console.log(err);
                    } else {
                        l.append('error', err);
                        Globals.error(err);
                    }
                    (typeof err === 'object') ? console.log(err) : Globals.error(err);
                }
                l.write();
                resolve();
            });
        });

};