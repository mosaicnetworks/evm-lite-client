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
                let connection = await session.connect(args.options.host, args.options.port);

                if (!connection) resolve();

                let formatted: boolean = args.options.formatted || false;
                let remote = args.options.remote || false;
                let accounts: BaseAccount[] = [];
                let accountsTable = new ASCIITable().setHeading('#', 'Address', 'Balance', 'Nonce');

                if (!remote) {
                    accounts = (await session.keystore.decrypt(connection)).map(account => account.toBaseAccount());
                } else {
                    accounts = await connection.api.getAccounts();
                }

                if (!accounts || !accounts.length) {
                    Globals.warning('No accounts.');
                } else {
                    if (formatted) {
                        let counter = 1;
                        for (let account of accounts) {
                            accountsTable.addRow(counter, account.address, account.balance, account.nonce);
                            counter++;
                        }
                    }

                    Globals.success((formatted) ? accountsTable.toString() : JSONBig.stringify(accounts));
                }

                resolve();
            });
        });

};