/**
 * @file AccountsGet.ts
 * @author Mosaic Networks <https://github.com/mosaicnetworks>
 * @date 2018
 */

import * as Vorpal from "vorpal";
import * as inquirer from 'inquirer';
import * as ASCIITable from 'ascii-table';

import Staging, {execute, Message, StagedOutput, StagingFunction} from "../classes/Staging";

import Session from "../classes/Session";

/**
 * Should return either a Staged error or success.
 *
 * @remarks
 * This staging function will parse all the arguments of the `accounts get` command
 * and resolve a success or an error.
 *
 * @param args - Arguments to the command. @link
 * @param session - Controls the session of the CLI instance.
 * @returns An object specifying a success or an error.
 *
 * @alpha
 */
export const stage: StagingFunction = (args: Vorpal.Args, session: Session): Promise<StagedOutput<Message>> => {
    return new Promise<StagedOutput<Message>>(async (resolve) => {

        let {error, success} = Staging.getStagingFunctions(args);

        let connection = await session.connect(args.options.host, args.options.port);
        if (!connection) {
            resolve(error(Staging.ERRORS.INVALID_CONNECTION));
            return;
        }

        let interactive = args.options.interactive || session.interactive;
        let formatted = args.options.formatted || false;
        let questions = [
            {
                name: 'address',
                type: 'input',
                required: true,
                message: 'Address: '
            }
        ];

        if (interactive && !args.address) {
            let {address} = await inquirer.prompt(questions);
            args.address = address;
        }

        if (!args.address) {
            resolve(error(Staging.ERRORS.BLANK_FIELD, 'Provide a non-empty address.'));
            return;
        }

        let account = await connection.api.getAccount(args.address);
        if (!account) {
            resolve(error(Staging.ERRORS.FETCH_FAILED, 'Could not fetch account: ' + args.address));
            return;
        }

        let table = new ASCIITable().setHeading('Address', 'Balance', 'Nonce');
        if (formatted) {
            table.addRow(account.address, account.balance, account.nonce);
        }

        resolve(success((formatted) ? table : account));
    });
};

/**
 * Should construct a Vorpal.Command instance for the command `accounts get`.
 *
 * @remarks
 * Allows you to get account details such as balance and nonce from the blockchain.
 *
 * Usage: `accounts get --formatted 0x583560ee73713a6554c463bd02349841cd79f6e2`
 *
 * The above command will get the account balance and nonce from the node and format
 * the returned JSON into an ASCII table.
 *
 * @param evmlc - The CLI instance.
 * @param session - Controls the session of the CLI instance.
 * @returns The Vorpal.Command instance of `accounts get`.
 *
 * @alpha
 */
export default function commandAccountsGet(evmlc: Vorpal, session: Session) {

    let description =
        'Gets account balance and nonce from a node with a valid connection.';

    return evmlc.command('accounts get [address]').alias('a g')
        .description(description)
        .option('-f, --formatted', 'format output')
        .option('-i, --interactive', 'use interactive mode')
        .option('-h, --host <ip>', 'override config parameter host')
        .option('-p, --port <port>', 'override config parameter port')
        .types({
            string: ['_', 'h', 'host']
        })
        .action((args: Vorpal.Args): Promise<void> => execute(stage, args, session));

};