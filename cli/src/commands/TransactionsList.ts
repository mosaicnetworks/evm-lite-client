import * as Vorpal from "vorpal";
import * as JSONBig from 'json-bigint';

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
                    let made: boolean = await session.transactions.makeTransactionsTable();
                    console.log(made);
                } catch (err) {
                    (typeof err === 'object') ? console.log(err) : Globals.error(err);
                }
                resolve();
            });
        });

};