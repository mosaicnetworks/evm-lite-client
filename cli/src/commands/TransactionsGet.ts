import * as Vorpal from "vorpal";
import * as ASCIITable from 'ascii-table';
import * as inquirer from 'inquirer';

import {TXReceipt} from "../utils/Globals";
import Staging, {execute, Message, StagedOutput, StagingFunction} from "../classes/Staging";

import Session from "../classes/Session";


export const stage: StagingFunction = (args: Vorpal.Args, session: Session): Promise<StagedOutput<Message>> => {
    return new Promise<StagedOutput<Message>>(async (resolve) => {
        let {error, success} = Staging.getStagingFunctions(args);
        let connection = await session.connect(args.options.host, args.options.port);
        if (!connection) {
            resolve(error(Staging.ERRORS.INVALID_CONNECTION,));
            return;
        }

        let table = new ASCIITable('Transaction Receipt').setHeading('Key', 'Value');
        let interactive = args.options.interactive || session.interactive;
        let formatted = args.options.formatted || false;
        let questions = [
            {
                name: 'hash',
                type: 'input',
                required: true,
                message: 'Transaction Hash: '
            }
        ];

        if (interactive) {
            let {hash} = await inquirer.prompt(questions);

            args.hash = hash;
        }

        if (!args.hash) {
            resolve(error(
                Staging.ERRORS.BLANK_FIELD,
                'Provide a transaction hash. Usage: transactions get <hash>'
            ));
            return;
        }

        let receipt: TXReceipt = await connection.api.getReceipt(args.hash);

        if (!receipt) {
            resolve(error(
                Staging.ERRORS.FETCH_FAILED,
                'Could not fetch receipt for hash: ' + args.hash
            ));
            return;
        }

        delete receipt.logsBloom;
        delete receipt.contractAddress;

        if (!formatted) {
            resolve(success(receipt));
            return;
        }

        for (let key in receipt) {
            if (receipt.hasOwnProperty(key)) {
                table.addRow(key, receipt[key]);
            }
        }

        let tx = session.database.transactions.get(args.hash);

        if (!tx) {
            resolve(error(
                Staging.ERRORS.FETCH_FAILED,
                'Could not find transaction in list.'
            ));
            return;
        }

        table
            .addRow('Value', tx.value)
            .addRow('Gas', tx.gas)
            .addRow('Gas Price', tx.gasPrice);

        resolve(success(table));
    });
};

export default function commandTransactionsGet(evmlc: Vorpal, session: Session) {

    let description =
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