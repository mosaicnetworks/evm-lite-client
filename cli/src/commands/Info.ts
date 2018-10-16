import * as Vorpal from "vorpal";
import * as JSONBig from 'json-bigint';
import * as ASCIITable from 'ascii-table';

import Globals from "../utils/Globals";
import Session from "../classes/Session";


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
                let l = session.log().withCommand('command info');
                try {
                    let formatted = args.options.formatted || false;

                    let connection = await session.connect(args.options.host, args.options.port);
                    l.append('connection', 'successful');

                    let response = await connection.api.getInfo();
                    l.append('request', 'successful');

                    let information = JSONBig.parse(response);
                    let table = new ASCIITable().setHeading('Name', 'Value');

                    if (formatted) {
                        l.append('formatted', 'true');
                        for (let key in information) {
                            if (information.hasOwnProperty(key)) {
                                table.addRow(key, information[key]);
                            }
                        }
                        Globals.success(table.toString());
                    } else {
                        l.append('formatted', 'false');
                        Globals.success(response);
                    }

                } catch (err) {
                    (typeof err === 'object') ? console.log(err) : Globals.error(err);
                }
                resolve();
            });
        });
};

