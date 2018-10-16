import * as Vorpal from "vorpal";
import * as JSONBig from 'json-bigint';
import * as ASCIITable from 'ascii-table';

import Globals from "../utils/Globals";
import Session from "../classes/Session";

interface TXReceipt {
    root: string,
    transactionHash: string,
    from: string,
    to?: string,
    gasUsed: number,
    cumulativeGasUsed: number,
    contractAddress: string,
    logs: [],
    logsBloom: string,
    failed: boolean
}

export default function TransactionsList(evmlc: Vorpal, session: Session) {

    let description =
        'Lists all sent transactions.';

    return evmlc.command('transactions list').alias('t l')
        .description(description)
        .option('-f, --formatted', 'format output')
        .option('-v, --verbose', 'verbose output')
        .option('-h, --host <ip>', 'override config parameter host')
        .option('-p, --port <port>', 'override config parameter port')
        .types({
            string: ['h', 'host']
        })
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>(async (resolve) => {
                let l = session.log().withCommand('transactions list');
                try {
                    let connection = await session.connect(args.options.host, args.options.port);
                    l.append('connection', 'successful');
                    let formatted = args.options.formatted || false;
                    l.append('formatted', formatted);
                    let verbose = args.options.verbose || false;
                    l.append('verbose', 'verbose');
                    let table = new ASCIITable();
                    let transactions = session.database.transactions.all();

                    if (formatted) {
                        if (transactions.length) {
                            if (verbose) {
                                table.setHeading('Date Time', 'Hash', 'From', 'To', 'Value', 'Gas', 'Gas Price', 'Status');
                                for (let tx of transactions) {
                                    let date = new Date(tx.date);
                                    let d = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
                                    let t = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                                    let receipt: TXReceipt = await connection.getReceipt(tx.txHash);
                                    table.addRow(`${d} ${t}`, tx.txHash, tx.from, tx.to, tx.value,tx.gas, tx.gasPrice,
                                        (receipt) ? ((!receipt.failed) ? 'Success' : 'Failed') : 'Failed');
                                }
                            } else {
                                table.setHeading('From', 'To', 'Value', 'Status');
                                for (let tx of transactions) {
                                    let receipt: TXReceipt = await connection.getReceipt(tx.txHash);
                                    table.addRow(tx.from, tx.to, tx.value,
                                        (receipt) ? ((!receipt.failed) ? 'Success' : 'Failed') : 'Failed');
                                }
                            }
                            Globals.success(table.toString());
                        } else {
                            Globals.warning('No transactions submitted.')
                        }
                    } else {
                        Globals.success(JSONBig.stringify(session.database.transactions.all()));
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
                }

                l.write();
                resolve();
            });
        });

};