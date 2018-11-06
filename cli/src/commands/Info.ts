/**
 * @file AccountsCreate.ts
 * @author Mosaic Networks <https://github.com/mosaicnetworks>
 * @date 2018
 */

import * as ASCIITable from 'ascii-table';
import * as Vorpal from "vorpal";

import Staging, {execute, Message, StagedOutput, StagingFunction} from "../classes/Staging";

import Session from "../classes/Session";

/**
 * Should return either a Staged error or success.
 *
 * @remarks
 * This staging function will parse all the arguments of the `info` command
 * and resolve a success or an error.
 *
 * @param args - Arguments to the command.
 * @param session - Controls the session of the CLI instance.
 * @returns An object specifying a success or an error.
 *
 * @alpha
 */
export const stage: StagingFunction = (args: Vorpal.Args, session: Session): Promise<StagedOutput<Message>> => {
    return new Promise<StagedOutput<Message>>(async (resolve) => {

        const {error, success} = Staging.getStagingFunctions(args);

        const connection = await session.connect(args.options.host, args.options.port);
        if (!connection) {
            resolve(error(Staging.ERRORS.INVALID_CONNECTION));
            return;
        }

        const information = await connection.api.getInfo();
        if (!information) {
            resolve(error(Staging.ERRORS.FETCH_FAILED, 'Cannot fetch information.'));
            return;
        }

        const formatted = args.options.formatted || false;
        if (!formatted) {
            resolve(success(information));
            return;
        }

        const table = new ASCIITable().setHeading('Name', 'Value');
        for (const key in information) {
            if (information.hasOwnProperty(key)) {
                table.addRow(key, information[key]);
            }
        }

        resolve(success(table));
    });
};

/**
 * Should construct a Vorpal.Command instance for the command `info`.
 *
 * @remarks
 * Prints information about the node in JSON or formatted into an ASCII table.
 *
 * Usage: `info --formatted`
 *
 * Here we have executed a command to view information about the node in an ASCII table.
 *
 * @param evmlc - The CLI instance.
 * @param session - Controls the session of the CLI instance.
 * @returns The Vorpal.Command instance of `accounts get`.
 *
 * @alpha
 */
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

