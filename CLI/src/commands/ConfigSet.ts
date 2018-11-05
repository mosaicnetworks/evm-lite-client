/**
 * @file AccountsCreate.ts
 * @author Mosaic Networks <https://github.com/mosaicnetworks>
 * @date 2018
 */

import * as inquirer from 'inquirer';
import * as Vorpal from "vorpal";

import Staging, {execute, Message, StagedOutput, StagingFunction} from "../classes/Staging";

import Session from "../classes/Session";

/**
 * Should return either a Staged error or success.
 *
 * @remarks
 * This staging function will parse all the arguments of the `config set` command
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

        const interactive = args.options.interactive || session.interactive;
        const questions = [];

        function populateQuestions(object) {
            for (const key in object) {
                if (object.hasOwnProperty(key)) {
                    if (typeof object[key] === 'object') {
                        populateQuestions(object[key]);
                    } else {
                        questions.push({
                            default: object[key],
                            message: `${key.charAt(0).toUpperCase() + key.slice(1)}: `,
                            name: key,
                            type: 'input',
                        });
                    }
                }
            }
        }

        populateQuestions(session.config.data);

        if (interactive) {
            const answers = await inquirer.prompt(questions);
            for (const key in answers) {
                if (answers.hasOwnProperty(key)) {
                    args.options[key.toLowerCase()] = answers[key];
                }
            }
        }

        if (!Object.keys(args.options).length) {
            resolve(error(Staging.ERRORS.BLANK_FIELD, 'No options provided.'));
            return;
        }

        for (const key in args.options) {
            if (args.options.hasOwnProperty(key)) {
                if (session.config.data.defaults[key] !== args.options[key] && key !== 'interactive') {
                    session.config.data.defaults[key] = args.options[key]
                }
            }
        }

        const saved = await session.config.save();

        resolve(success(saved ? 'Configuration saved.' : 'No changes detected.'));
    });
};

/**
 * Should construct a Vorpal.Command instance for the command `config set`.
 *
 * @remarks
 * Allows you to set EVM-Lite CLI configuration settings through the CLI. Can be done interactively.
 *
 * Usage: `config set --host 5.5.5.1`
 *
 * Here we have executed a command to change the default host to connect to for any command
 * through the CLI to `5.5.5.1`.
 *
 * @param evmlc - The CLI instance.
 * @param session - Controls the session of the CLI instance.
 * @returns The Vorpal.Command instance of `accounts get`.
 *
 * @alpha
 */
export default function commandConfigSet(evmlc: Vorpal, session: Session) {

    const description =
        'Set values of the configuration inside the data directory.';

    return evmlc.command('config set').alias('c s')
        .description(description)
        .option('-i, --interactive', 'enter into interactive command')
        .option('-h, --host <host>', 'default host')
        .option('-p, --port <port>', 'default port')
        .option('--from <from>', 'default from')
        .option('--gas <gas>', 'default gas')
        .option('--gasPrice <gasprice>', 'gas price')
        .option('--keystore <path>', 'keystore path')
        .option('--pwd <path>', 'password path')
        .types({
            string: ['h', 'host', 'from', 'keystore', 'pwd']
        })
        .action((args: Vorpal.Args): Promise<void> => execute(stage, args, session));

};