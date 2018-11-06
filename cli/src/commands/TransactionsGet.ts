/**
 * @file AccountsCreate.ts
 * @author Mosaic Networks <https://github.com/mosaicnetworks>
 * @date 2018
 */

import * as ASCIITable from 'ascii-table';
import * as inquirer from 'inquirer';
import * as Vorpal from "vorpal";

import Staging, {execute, Message, StagedOutput, StagingFunction} from "../classes/Staging";
import {TXReceipt} from "../utils/Globals";

import Session from "../classes/Session";

/**
 * Should return either a Staged error or success.
 *
 * @remarks
 * This staging function will parse all the arguments of the `transactions get` command
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

        const connection = await session.connect(args.options.host, args.options.port);
        if (!connection) {
            resolve(error(Staging.ERRORS.INVALID_CONNECTION,));
            return;
        }

        const table = new ASCIITable('Transaction Receipt').setHeading('Key', 'Value');
        const interactive = args.options.interactive || session.interactive;
        const formatted = args.options.formatted || false;
        const questions = [
            {
                message: 'Transaction Hash: ',
                name: 'hash',
                required: true,
                type: 'input',
            }
        ];

        if (interactive && !args.hash) {
            const {hash} = await inquirer.prompt(questions);
            args.hash = hash;
        }

        if (!args.hash) {
            resolve(error(Staging.ERRORS.BLANK_FIELD, 'Provide a transaction hash.'));
            return;
        }

        const receipt: TXReceipt = await connection.api.getReceipt(args.hash);
        if (!receipt) {
            resolve(error(Staging.ERRORS.FETCH_FAILED, 'Could not fetch receipt for hash: ' + args.hash));
            return;
        }

        delete receipt.logsBloom;
        delete receipt.contractAddress;

        if (!formatted) {
            resolve(success(receipt));
            return;
        }

        for (const key in receipt) {
            if (receipt.hasOwnProperty(key)) {
                if (key !== 'status') {
                    table.addRow(key, receipt[key]);
                } else {
                    table.addRow(key, (!receipt[key]) ? 'Successful' : 'Failed')
                }
            }
        }

        const tx = session.database.transactions.get(args.hash);
        if (!tx) {
            resolve(error(Staging.ERRORS.FETCH_FAILED, 'Could not find transaction in list.'));
            return;
        }

        table
            .addRow('Value', tx.value)
            .addRow('Gas', tx.gas)
            .addRow('Gas Price', tx.gasPrice);

        resolve(success(table));
    });
};

/**
 * Should construct a Vorpal.Command instance for the command `transactions get`.
 *
 * @remarks
 * Allows you to get transaction details such as `gas`, `gasprice`, `status`, `to` etc. using a
 * transaction hash.
 *
 * Usage: `transactions get --formatted 0xf4d71b947c7d870332b849b489a8f4dcdca166f9c485963b473724eab9eaee62`
 *
 * Here we have requested the details of the transaction with hash the specified hash and asked that the
 * data is formatted into an ASCII table.
 *
 * @param evmlc - The CLI instance.
 * @param session - Controls the session of the CLI instance.
 * @returns The Vorpal.Command instance of `accounts create`.
 *
 * @alpha
 */
export default function commandTransactionsGet(evmlc: Vorpal, session: Session) {

    const description =
        'Gets a transaction using its hash.';

    return evmlc.command('transactions get [hash]').alias('t g')
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