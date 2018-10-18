import * as Vorpal from "vorpal";
import * as JSONBig from 'json-bigint';
import * as ASCIITable from 'ascii-table';

import Session from "../classes/Session";
import Globals from "../utils/Globals";


export default function commandInfo(evmlc: Vorpal, session: Session) {
    return evmlc.command('info')
        .description('Prints information about node as JSON or --formatted.')
        .option('-f, --formatted', 'format output')
        .option('-h, --host <ip>', 'override config parameter host')
        .option('-p, --port <port>', 'override config parameter port')
        .types({
            string: ['h', 'host']
        })
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>(async (resolve) => {
                let connection = await session.connect(args.options.host, args.options.port);
                if (!connection) {
                    resolve();
                    return;
                }

                let information = await connection.api.getInfo();
                if (!information) {
                    resolve();
                    return;
                }

                let formatted = args.options.formatted || false;
                if (!formatted) {
                    Globals.success(JSONBig.stringify(information));
                    resolve();
                    return;
                }

                let table = new ASCIITable().setHeading('Name', 'Value');
                for (let key in information) {
                    if (information.hasOwnProperty(key)) {
                        table.addRow(key, information[key]);
                    }
                }

                Globals.success(table.toString());
                resolve();
            });
        });
};

