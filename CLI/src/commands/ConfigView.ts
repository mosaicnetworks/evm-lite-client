/**
 * @file AccountsCreate.ts
 * @author Mosaic Networks <https://github.com/mosaicnetworks>
 * @date 2018
 */

import * as Vorpal from "vorpal";

import Staging, {execute, Message, StagedOutput, StagingFunction} from "../classes/Staging";

import Session from "../classes/Session";

/**
 * Should return either a Staged error or success.
 *
 * @remarks
 * This staging function will parse all the arguments of the `config view` command
 * and resolve a success or an error.
 *
 * @param args - Arguments to the command.
 * @param session - Controls the session of the CLI instance.
 * @returns An object specifying a success or an error.
 *
 * @alpha
 */
export const stage: StagingFunction = (args: Vorpal.Args, session: Session): Promise<StagedOutput<Message>> => {
    return new Promise<StagedOutput<Message>>((resolve) => {
        const {error, success} = Staging.getStagingFunctions(args);

        const message: string = `Config file location: ${session.config.path} \n\n` + session.config.toTOML();
        resolve(success(message))
    });
};

/**
 * Should construct a Vorpal.Command instance for the command `config view`.
 *
 * @remarks
 * Allows you to view the current configuration file for the CLI.
 *
 * Usage: `config view`
 *
 * Here we have executed a command to view the current configuration file.
 *
 * @param evmlc - The CLI instance.
 * @param session - Controls the session of the CLI instance.
 * @returns The Vorpal.Command instance of `accounts get`.
 *
 * @alpha
 */
export default function commandConfigUser(evmlc: Vorpal, session: Session) {

    const description =
        'Output current configuration file as JSON.';

    return evmlc.command('config view').alias('c v')
        .description(description)
        .action((args: Vorpal.Args): Promise<void> => execute(stage, args, session));

};