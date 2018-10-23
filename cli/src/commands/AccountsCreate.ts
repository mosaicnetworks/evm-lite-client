import * as Vorpal from "vorpal";
import * as inquirer from 'inquirer';
import * as fs from "fs";
import * as JSONBig from 'json-bigint';

import Staging, {execute, Message, StagedOutput, StagingFunction} from "../classes/Staging";

import Session from "../classes/Session";
import Keystore from "../classes/Keystore";


export const stage: StagingFunction = (args: Vorpal.Args, session: Session): Promise<StagedOutput<Message>> => {
    return new Promise<StagedOutput<Message>>(async (resolve) => {

        let {error, success} = Staging.getStagingFunctions(args);

        let interactive = !args.options.password || session.interactive;
        let verbose = args.options.verbose || false;
        let questions = [
            {
                name: 'output',
                message: 'Enter keystore output path: ',
                default: session.keystore.path,
                type: 'input'
            },
            {
                name: 'password',
                message: 'Enter a password: ',
                type: 'password'
            },
            {
                name: 'verifyPassword',
                message: 'Re-enter password: ',
                type: 'password'
            }
        ];

        if (interactive) {
            let {output, password, verifyPassword} = await inquirer.prompt(questions);

            if (!(password && verifyPassword && (password === verifyPassword))) {
                resolve(error(
                    Staging.ERRORS.BLANK_FIELD,
                    'Passwords either blank or do not match.'
                ));
                return;
            }

            if (!Staging.exists(output)) {
                resolve(error(
                    Staging.ERRORS.DIRECTORY_NOT_EXIST,
                    'Output directory does not exist.'
                ));
                return;
            }

            if (!Staging.isDirectory(output)) {
                resolve(error(
                    Staging.ERRORS.IS_FILE,
                    'Output path is not a directory.'
                ));
                return;
            }

            args.options.password = password;
            args.options.output = output;
        } else {
            args.options.output = args.options.output || session.config.data.defaults.keystore;

            if (!Staging.exists(args.options.password)) {
                resolve(error(
                    Staging.ERRORS.PATH_NOT_EXIST,
                    'Password file provided does not exist.'
                ));
                return;
            }

            if (!Staging.exists(args.options.output)) {
                resolve(error(
                    Staging.ERRORS.DIRECTORY_NOT_EXIST,
                    'Output directory provided does not exist.'
                ));
                return;
            }

            if (Staging.isDirectory(args.options.password)) {
                resolve(error(
                    Staging.ERRORS.IS_DIRECTORY,
                    'Password file path provided is a directory.'
                ));
                return;
            }

            if (!Staging.isDirectory(args.options.output)) {
                resolve(error(
                    Staging.ERRORS.IS_FILE,
                    'Output path is not a directory.'
                ));
                return;
            }

            args.options.password = fs.readFileSync(args.options.password, 'utf8');
        }

        let password = args.options.password;
        let output = args.options.output;
        let sAccount = Keystore.create(output, password);
        let account = JSONBig.parse(sAccount);
        let message: string = '';

        if (!verbose) {
            message = '0x' + account.address;
        } else {
            message = account;
        }

        resolve(success(message));
    })
};

export default function commandAccountsCreate(evmlc: Vorpal, session: Session) {

    let description =
        'Allows you to create and encrypt accounts locally. Created accounts will either be placed in the' +
        ' keystore folder inside the data directory provided by the global --datadir, -d flag or if no flag is' +
        ' provided, in the keystore specified in the configuration file.';

    return evmlc.command('accounts create').alias('a c')
        .description(description)
        .option('-o, --output <path>', 'keystore file output path')
        .option('-v, --verbose', 'show verbose output')
        .option('-p, --password <file_path>', 'password file path')
        .types({
            string: ['p', 'password', 'o', 'output']
        })
        .action((args: Vorpal.Args): Promise<void> => execute(stage, args, session));
};