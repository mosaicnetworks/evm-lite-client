/**
 * @file AccountsList.ts
 * @author Mosaic Networks <https://github.com/mosaicnetworks>
 * @date 2018
 */

import * as ASCIITable from 'ascii-table';
import * as Vorpal from "vorpal";

import {Controller} from "../../../lib"
import Staging, {execute, Message, StagedOutput, StagingFunction} from "../classes/Staging";

import Session from "../classes/Session";

/**
 * Should return either a Staged error or success.
 *
 * @remarks
 * This staging function will parse all the arguments of the `accounts list` command
 * and resolve a success or an error.
 *
 * @param args - Arguments to the command.
 * @param session - Controls the session of the CLI instance.
 * @returns An object specifying a success or an error.
 *
 * @alpha
 */
export const stage: StagingFunction = (args: Vorpal.Args, session: Session): Promise<StagedOutput<Message>> => {
    return new Promise<StagedOutput<Message>>(async (resolve) => {

        const {error, success} = Staging.getStagingFunctions(args);

        const remote = args.options.remote || false;
        const verbose = args.options.verbose || false;
        const formatted = args.options.formatted || false;
        const table = new ASCIITable();

        let connection: Controller = null;
        if (verbose || remote) {
            connection = await session.connect(args.options.host, args.options.port);
            if (!connection) {
                resolve(error(Staging.ERRORS.INVALID_CONNECTION));
                return;
            }
        }

        const accounts = remote ? await connection.api.getAccounts() : await session.keystore.all(verbose, connection);
        if (!accounts || !accounts.length) {
            resolve(success([]));
            return;
        }

        if (!formatted) {
            resolve(success(accounts));
            return;
        }

        (verbose) ? table.setHeading('Address', 'Balance', 'Nonce') : table.setHeading('Address');
        for (const account of accounts) {
            (verbose) ? table.addRow(account.address, account.balance, account.nonce) : table.addRow(account.address);
        }

        resolve(success(table));
    });
};

/**
 * Should construct a Vorpal.Command instance for the command `accounts list`.
 *
 * @remarks
 * Allows you to list all the accounts either locally or remote. If account details such
 * as balance and nonce are required then the `--verbose, -v` flag should be provided.
 * Local accounts are read from the `keystore` provided in the configuration file.
 *
 * Usage: `accounts list --verbose --formatted`
 *
 * Here we have asked to display the formatted version of all the accounts along with
 * their balance and nonce which is specified by the `verbose` flag. All accounts are
 * sourced from the local keystore.
 *
 * @param evmlc - The CLI instance.
 * @param session - Controls the session of the CLI instance.
 * @returns The Vorpal.Command instance of `accounts get`.
 *
 * @alpha
 */
export default function commandAccountsList(evmlc: Vorpal, session: Session) {

    const description =
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