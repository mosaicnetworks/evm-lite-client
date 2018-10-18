import * as Vorpal from "vorpal";
import * as inquirer from 'inquirer';
import * as fs from "fs";
import * as JSONBig from 'json-bigint';

import Globals from "../utils/Globals";
import Session from "../classes/Session";
import Keystore from "../classes/Keystore";


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
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>(async (resolve) => {
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
                        Globals.error('Error: Passwords either blank or do not match.');
                        resolve();
                        return;
                    }

                    if (!fs.existsSync(output)) {
                        Globals.error('Error: Output directory does not exist.');
                        resolve();
                        return;
                    }

                    if (!fs.lstatSync(output).isDirectory()) {
                        Globals.error('Error: Output path is not a directory.');
                        resolve();
                        return;
                    }

                    args.options.password = password;
                    args.options.output = output;
                } else {
                    args.options.output = args.options.output || session.config.data.storage.keystore;

                    if (!fs.existsSync(args.options.password) || !fs.existsSync(args.options.output)) {
                        Globals.error('Output path or password file path provided does not exist.');
                        resolve();
                        return;
                    }

                    if (fs.lstatSync(args.options.password).isDirectory()) {
                        Globals.error('Password file path provided is a directory.');
                        resolve();
                        return;
                    }

                    if (!fs.existsSync(args.options.output)) {
                        Globals.error('Error: Output directory does not exist.');
                        resolve();
                        return;
                    }

                    if (!fs.lstatSync(args.options.output).isDirectory()) {
                        Globals.error('Error: Output path is not a directory.');
                        resolve();
                        return;
                    }

                    args.options.password = fs.readFileSync(args.options.password);
                }

                let password = args.options.password;
                let output = args.options.output;
                let sAccount = Keystore.create(output, password);
                let account = JSONBig.parse(sAccount);

                if (!verbose) {
                    Globals.success(`Address: ${account.address}`);
                } else {
                    Globals.success(sAccount);
                }

                resolve();
            })
        });
};