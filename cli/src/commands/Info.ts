import * as Vorpal from "vorpal";
import * as ASCIITable from 'ascii-table';

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

        let information = await connection.api.getInfo();
        if (!information) {
            resolve(error(Staging.ERRORS.FETCH_FAILED, 'Cannot fetch information.'));
            return;
        }

        let formatted = args.options.formatted || false;
        if (!formatted) {
            resolve(success(information));
            return;
        }

        let table = new ASCIITable().setHeading('Name', 'Value');
        for (let key in information) {
            if (information.hasOwnProperty(key)) {
                table.addRow(key, information[key]);
            }
        }

        resolve(success(table));
    });
};

export default function commandInfo(evmlc: Vorpal, session: Session) {

    return evmlc.command('info')
        .description('Prints information about node as JSON or --formatted.')
        .option('-f, --formatted', 'format output')
        .option('-h, --host <ip>', 'override config parameter host')
        .option('-p, --port <port>', 'override config parameter port')
        .types({
            string: ['h', 'host']
        })
        .action((args: Vorpal.Args): Promise<void> => execute(stage, args, session));

};

