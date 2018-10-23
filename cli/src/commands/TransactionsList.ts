import * as Vorpal from "vorpal";
import * as ASCIITable from 'ascii-table';

import {TXReceipt} from "../utils/Globals";
import Staging, {execute, Message, StagedOutput, StagingFunction} from "../classes/Staging";

import Session from "../classes/Session";


export const stage: StagingFunction = (args: Vorpal.Args, session: Session): Promise<StagedOutput<Message>> => {
    return new Promise<StagedOutput<Message>>(async (resolve) => {
        let {error, success} = Staging.getStagingFunctions(args);
        let connection = await session.connect(args.options.host, args.options.port);

        if (!connection) {
            resolve(error(Staging.ERRORS.INVALID_CONNECTION));
            return;
        }

        let formatted = args.options.formatted || false;
        let verbose = args.options.verbose || false;
        let table = new ASCIITable();
        let transactions = session.database.transactions.all();

        if (!transactions.length) {
            resolve(success([]));
            return;
        }

        if (!formatted) {
            resolve(success(session.database.transactions.all()));
            return;
        }

        if (verbose) {
            table.setHeading('Date Time', 'Hash', 'From', 'To', 'Value', 'Gas', 'Gas Price', 'Status');

            for (let tx of transactions) {
                let date = new Date(tx.date);
                let d = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
                let t = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                let receipt: TXReceipt = await connection.api.getReceipt(tx.txHash);

                table.addRow(`${d} ${t}`, tx.txHash, tx.from, tx.to, tx.value, tx.gas, tx.gasPrice,
                    (receipt) ? ((!receipt.status) ? 'Success' : 'Failed') : 'Failed');
            }
        } else {
            table.setHeading('From', 'To', 'Value', 'Status');

            for (let tx of transactions) {
                let receipt: TXReceipt = await connection.api.getReceipt(tx.txHash);

                table.addRow(tx.from, tx.to, tx.value,
                    (receipt) ? ((!receipt.status) ? 'Success' : 'Failed') : 'Failed');
            }
        }

        resolve(success(table));
    });
};

export default function commandTransactionsList(evmlc: Vorpal, session: Session) {

    let description =
        'Lists all submitted transactions with the status.';

    return evmlc.command('transactions list').alias('t l')
        .description(description)
        .option('-f, --formatted', 'format output')
        .option('-v, --verbose', 'verbose output')
        .option('-h, --host <ip>', 'override config parameter host')
        .option('-p, --port <port>', 'override config parameter port')
        .types({
            string: ['h', 'host']
        })
        .action((args: Vorpal.Args): Promise<void> => execute(stage, args, session));

};