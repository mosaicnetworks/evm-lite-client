import * as Vorpal from "vorpal";
import * as JSONBig from 'json-bigint';
import * as ASCIITable from 'ascii-table';

import {error, info, success} from "../utils/globals";

import Session from "../classes/Session";


export default function commandInfo(evmlc: Vorpal, session: Session) {
    return evmlc.command('info')
        .description('Prints information about node as JSON or --formatted.')
        .option('-f, --formatted', 'format output')
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>(resolve => {
                let formatted = args.options.formatted || false;

                session.connect()
                    .then((connection) => {
                        connection.api.getInfo()
                            .then((res: string) => {
                                if (formatted) {
                                    let information = JSONBig.parse(res);
                                    let table = new ASCIITable('Info');

                                    Object.keys(information).forEach(function (key) {
                                        table.addRow(key, information[key]);
                                    });

                                    info(table.toString());
                                } else {
                                    success(res);
                                }
                            })
                            .catch(err => error(err));
                    })
                    .catch(err => error(err))

            });
        })
        .description('Testing purposes.');
};

