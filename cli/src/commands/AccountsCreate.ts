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

        let interactive = !args.options.pwd || session.interactive;
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
                resolve(error(Staging.ERRORS.BLANK_FIELD, 'Passwords either blank or do not match.'));
                return;
            }

            args.options.pwd = password;
            args.options.output = output;
        } else {
            if (!Staging.exists(args.options.pwd)) {
                resolve(error(Staging.ERRORS.PATH_NOT_EXIST, 'Password file provided does not exist.'));
                return;
            }

            if (Staging.isDirectory(args.options.pwd)) {
                resolve(error(Staging.ERRORS.IS_DIRECTORY, 'Password file path provided is a directory.'));
                return;
            }

            args.options.pwd = fs.readFileSync(args.options.pwd, 'utf8');
        }

        args.options.output = args.options.output || session.config.data.defaults.keystore;
        if (!Staging.exists(args.options.output)) {
            resolve(error(Staging.ERRORS.DIRECTORY_NOT_EXIST, 'Output directory does not exist.'));
            return;
        }
        if (!Staging.isDirectory(args.options.output)) {
            resolve(error(Staging.ERRORS.IS_FILE, 'Output path is not a directory.'));
            return;
        }

        let account = JSONBig.parse(Keystore.create(args.options.output, args.options.pwd));
        resolve(success(verbose ? account : `0x${account.address}`));
    })
};

export default function commandAccountsCreate(evmlc: Vorpal, session: Session): Vorpal.Command {

    let description =
        'Allows you to create and encrypt accounts locally. Created accounts will either be placed in the' +
        ' keystore folder inside the data directory provided by the global --datadir, -d flag or if no flag is' +
        ' provided, in the keystore specified in the configuration file.';

    return evmlc.command('accounts create').alias('a c')
        .description(description)
        .option('-o, --output <path>', 'keystore file output path')
        .option('-v, --verbose', 'show verbose output')
        .option('--pwd <file_path>', 'password file path')
        .types({
            string: ['pwd', 'o', 'output']
        })
        .action((args: Vorpal.Args): Promise<void> => execute(stage, args, session));
};