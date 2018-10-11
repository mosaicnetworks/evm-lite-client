import * as Vorpal from "vorpal";
import * as JSONBig from 'json-bigint';

import {error, info, success} from "../utils/globals";

import Session from "../classes/Session";


export default function commandInfo(evmlc: Vorpal, session: Session) {
    return evmlc.command('info')
        .description('Prints information about node as JSON or --formatted.')
        .option('-f, --formatted', 'format output')
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>(async (resolve) => {
                try {
                    let formatted = args.options.formatted || false;
                    let connection = await session.connect();
                    let response = await connection.api.getInfo();
                    let information = JSONBig.parse(response);

                    (formatted) ? console.table(information) : success(response);
                } catch (err) {
                    (typeof err === 'object') ? console.log(err) : error(err);
                }
                resolve();
            });
        })
        .description('Testing purposes.');
};

