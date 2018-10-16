import * as Vorpal from "vorpal";
import * as inquirer from 'inquirer';

import Globals from "../utils/Globals";
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
                let l = session.log().withCommand('accounts create');

                try {
                    let interactive = args.options.interactive || session.interactive;
                    let questions = [
                        {
                            name: 'output',
                            message: 'Enter keystore output path: ',
                            default: session.keystore.path,
                            type: 'input'
                        },
                        {
                            name: 'password',
                            message: 'Enter password file path: ',
                            default: session.passwordPath,
                            type: 'input'
                        }
                    ];

                    if (interactive) {
                        l.append('mode', 'interactive');
                        let {output, password} = await inquirer.prompt(questions);

                        args.options.output = output;
                        args.options.password = password;
                    } else {
                        l.append('mode', 'non-interactive');
                    }

                    l.append('output directory', (args.options.output) ? args.options.output : 'default');
                    l.append('password file', (args.options.password) ? args.options.password : 'default');

                    Globals.success(session.keystore.create(args.options.output, args.options.password));

                    l.append('status', 'success');
                } catch (err) {
                    l.append('status', 'failed');
                    if (typeof err === 'object') {
                        l.append(err.name, err.text);
                        console.log(err);
                    } else {
                        l.append('error', err);
                        Globals.error(err);
                    }
                }

                l.write();
                resolve();
            })
        });
};