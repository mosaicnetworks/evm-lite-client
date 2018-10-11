import * as Vorpal from "vorpal";
import * as inquirer from 'inquirer';

import {error, success} from "../utils/globals";

import Session from "../classes/Session";


export default function commandAccountsCreate(evmlc: Vorpal, session: Session) {

    let description =
        'Allows you to create and encrypt accounts locally. Created accounts will either be placed in the' +
        ' keystore folder inside the data directory provided by the global --datadir, -d flag or if no flag is' +
        ' provided, in the keystore specified in the configuration file.';

    return evmlc.command('accounts create').alias('a c')
        .description(description)
        .option('-o, --output <path>', 'provide output path')
        .option('-p, --password <path>', 'provide password file path')
        .option('-i, --interactive', 'use interactive mode')
        .types({
            string: ['p', 'password', 'o', 'output']
        })
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>(async (resolve) => {
                try {
                    let interactive = args.options.interactive || session.interactive;
                    let questions = [
                        {
                            name: 'outputPath',
                            message: 'Enter keystore output path: ',
                            default: session.keystore.path,
                            type: 'input'
                        },
                        {
                            name: 'passwordPath',
                            message: 'Enter password file path: ',
                            default: session.passwordPath,
                            type: 'input'
                        }
                    ];

                    if (interactive) {
                        let answers = await inquirer.prompt(questions);

                        args.options.output = answers.outputPath;
                        args.options.password = answers.passwordPath;
                    }

                    success(session.keystore.create(args.options.output, args.options.password));
                } catch (err) {
                    (typeof err === 'object') ? console.log(err) : error(err);
                }

                resolve();
            })
        });
};