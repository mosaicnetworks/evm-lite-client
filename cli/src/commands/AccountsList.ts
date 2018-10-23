import * as Vorpal from "vorpal";
import * as ASCIITable from 'ascii-table';

import {Controller} from "../../../lib"
import {BaseAccount} from "../utils/Globals";
import Staging, {execute, Message, StagedOutput, StagingFunction} from "../classes/Staging";

import Session from "../classes/Session";


export const stage: StagingFunction = (args: Vorpal.Args, session: Session): Promise<StagedOutput<Message>> => {
    return new Promise<StagedOutput<Message>>(async (resolve) => {
        let {error, success} = Staging.getStagingFunctions(args);

        let remote = args.options.remote || false;
        let verbose: boolean = args.options.verbose || false;
        let formatted: boolean = args.options.formatted || false;
        let accounts: BaseAccount[] | void = [];
        let accountsTable = new ASCIITable();
        let connection: Controller = null;

        if (verbose || remote) {
            connection = await session.connect(args.options.host, args.options.port);

            if (!connection) {
                resolve(error(Staging.ERRORS.INVALID_CONNECTION));
                return;
            }
        }

        if (remote) {
            accounts = await connection.api.getAccounts();
        } else {
            accounts = await session.keystore.all(verbose, connection);
        }

        if (!accounts || !accounts.length) {
            resolve(success([]));
            return;
        }

        if (!formatted) {
            resolve(success(accounts));
            return;
        }

        if (verbose) {
            accountsTable.setHeading('Address', 'Balance', 'Nonce');
            for (let account of accounts) {
                accountsTable.addRow(account.address, account.balance, account.nonce);
            }
        } else {
            accountsTable.setHeading('Addresses');
            for (let account of accounts) {
                accountsTable.addRow(account.address);
            }
        }

        resolve(success(accountsTable));
    });
};

export default function commandAccountsList(evmlc: Vorpal, session: Session) {

    let description =
        'List all accounts in the local keystore directory provided by the configuration file. This command will ' +
        'also get a balance and nonce for all the accounts from the node if a valid connection is established.';

    return evmlc.command('accounts list').alias('a l')
        .description(description)
        .option('-f, --formatted', 'format output')
        .option('-v, --verbose', 'verbose output (fetches balance & nonce from node)')
        .option('-r, --remote', 'list remote accounts')
        .option('-h, --host <ip>', 'override config parameter host')
        .option('-p, --port <port>', 'override config parameter port')
        .types({
            string: ['h', 'host']
        })
        .action((args: Vorpal.Args): Promise<void> => execute(stage, args, session));

};