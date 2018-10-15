import * as Vorpal from "vorpal";
import * as JSONBig from 'json-bigint';
import * as ASCIITable from 'ascii-table';

import Globals from "../utils/Globals";
import Session from "../classes/Session";


export default function TransactionsList(evmlc: Vorpal, session: Session) {

    let description =
        'Lists all sent transactions.';

    return evmlc.command('transactions list').alias('t l')
        .description(description)
        .option('-f, --formatted', 'format output')
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>(async (resolve) => {
                try {
                    let formatted = args.options.formatted || false;
                    let counter =0;
                    let table = new ASCIITable();
                    table.setHeading('Hash', 'From', 'To', 'Value', 'Gas', 'Gas Price', 'Date Time');

                    if (formatted) {
                        if (session.database.transactions.all().length) {
                            session.database.transactions.all().forEach(tx => {
                                table.addRow(tx.txHash, tx.from, tx.to, tx.value, tx.gas, tx.gasPrice, tx.date);
                            });
                            Globals.success(table.toString());
                        } else {
                            Globals.warning('No transactions.')
                        }
                    } else {
                        Globals.success(JSONBig.stringify(session.database.transactions.all()));
                    }
                } catch (err) {
                    (typeof err === 'object') ? console.log(err) : console.log(err);
                }
                resolve();
            });
        });

};