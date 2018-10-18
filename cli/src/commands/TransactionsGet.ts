import * as Vorpal from "vorpal";
import * as ASCIITable from 'ascii-table';
import * as inquirer from 'inquirer';
import * as JSONBig from 'json-bigint';

import Globals, {TXReceipt} from "../utils/Globals";
import Session from "../classes/Session";


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
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>(async (resolve) => {
                let connection = await session.connect(args.options.host, args.options.port);
                if (!connection) {
                    resolve();
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
                    Globals.error('Provide a transaction hash. Usage: transactions get <hash>');
                    resolve();
                    return;
                }

                let receipt: TXReceipt = await connection.api.getReceipt(args.hash);

                if (!receipt) {
                    resolve();
                    return;
                }

                delete receipt.logsBloom;
                delete receipt.contractAddress;

                if (!formatted) {
                    Globals.success(JSONBig.stringify(receipt));
                    resolve();
                    return;
                }

                for (let key in receipt) {
                    if (receipt.hasOwnProperty(key)) {
                        table.addRow(key, receipt[key]);
                    }
                }

                let tx = session.database.transactions.get(args.hash);

                if (!tx) {
                    Globals.error('Could not find transaction in list.');
                    resolve();
                    return;
                }

                let txTable = new ASCIITable('Transaction')
                    .setHeading('From', 'To', 'Value', 'Gas', 'Gas Price');
                txTable.addRow(tx.from, tx.to, tx.value, tx.gas, tx.gasPrice);

                Globals.success(txTable.toString());
                Globals.success(table.toString());
                resolve();
            });
        });

};