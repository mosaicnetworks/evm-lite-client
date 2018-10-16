import * as Vorpal from "vorpal";
import * as inquirer from 'inquirer';

import Globals from "../utils/Globals";
import Session from "../classes/Session";


export default function commandConfigSet(evmlc: Vorpal, session: Session) {

    let description =
        'Set values of the configuration inside the data directory.';

    return evmlc.command('config set').alias('c s')
        .description(description)
        .option('-i, --interactive', 'enter into interactive command')
        .option('-h, --host <host>', 'default host')
        .option('-p, --port <port>', 'default port')
        .option('--from <from>', 'default from')
        .option('--gas <gas>', 'default gas')
        .option('--gasprice <gasprice>', 'gas price')
        .option('--keystore <path>', 'keystore path')
        .option('--pwd <path>', 'password path')
        .types({
            string: ['h', 'host', 'from', 'keystore', 'pwd']
        })
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>(async (resolve) => {
                let l = session.log().withCommand('config set');
                try {
                    let interactive = args.options.interactive || session.interactive;
                    let questions = [];

                    function populateQuestions(object) {
                        for (let key in object) {
                            if (object.hasOwnProperty(key)) {
                                if (typeof object[key] === 'object') {
                                    populateQuestions(object[key]);
                                } else {
                                    questions.push({
                                        name: key,
                                        default: object[key],
                                        type: 'input',
                                        message: `${key}: `
                                    });
                                }
                            }
                        }
                    }

                    populateQuestions(session.config.data);

                    if (interactive) {
                        l.append('mode', 'interactive');
                        let answers = await inquirer.prompt(questions);

                        args.options.host = answers.host;
                        args.options.port = answers.port;
                        args.options.from = answers.from;
                        args.options.gas = answers.gas;
                        args.options.gasprice = answers.gasPrice;
                        args.options.keystore = answers.keystore;
                        args.options.password = answers.password;
                    } else {
                        l.append('mode', 'non-interactive');
                    }

                    if (!Object.keys(args.options).length) {
                        Globals.error('No options provided. To enter interactive mode use: -i, --interactive.');
                        l.append('error', 'no options provided to update');
                    } else {
                        for (let prop in args.options) {
                            if (prop.toLowerCase() === 'host') {
                                if (session.config.data.connection.host !== args.options[prop]) {
                                    Globals.success(`Updated '${(prop)}' with value ${(args.options[prop])}.`);
                                    l.append('update', `'${(prop)}' with value ${(args.options[prop])}.`);
                                }

                                session.config.data.connection.host = args.options[prop];
                            }
                            if (prop.toLowerCase() === 'port') {
                                if (session.config.data.connection.port !== args.options[prop]) {
                                    Globals.success(`Updated '${(prop)}' with value ${(args.options[prop])}.`);
                                    l.append('update', `'${(prop)}' with value ${(args.options[prop])}.`);
                                }

                                session.config.data.connection.port = args.options[prop];
                            }
                            if (prop.toLowerCase() === 'from') {
                                if (session.config.data.defaults.from !== args.options[prop]) {
                                    Globals.success(`Updated '${(prop)}' with value ${(args.options[prop])}.`);
                                    l.append('update', `'${(prop)}' with value ${(args.options[prop])}.`);
                                }

                                session.config.data.defaults.from = args.options[prop];
                            }
                            if (prop.toLowerCase() === 'gas') {
                                if (session.config.data.defaults.gas !== args.options[prop]) {
                                    Globals.success(`Updated '${(prop)}' with value ${(args.options[prop])}.`);
                                    l.append('update', `'${(prop)}' with value ${(args.options[prop])}.`);
                                }

                                session.config.data.defaults.gas = args.options[prop];
                            }
                            if (prop.toLowerCase() === 'gasprice') {
                                if (session.config.data.defaults.gasPrice !== args.options[prop]) {
                                    Globals.success(`Updated '${(prop)}' with value ${(args.options[prop])}.`);
                                    l.append('update', `'${(prop)}' with value ${(args.options[prop])}.`);
                                }

                                session.config.data.defaults.gasPrice = args.options[prop];
                            }
                            if (prop.toLowerCase() === 'keystore') {
                                if (session.config.data.storage.keystore !== args.options[prop]) {
                                    Globals.success(`Updated '${(prop)}' with value ${(args.options[prop])}.`);
                                    l.append('update', `'${(prop)}' with value ${(args.options[prop])}.`);
                                }

                                session.config.data.storage.keystore = args.options[prop];
                            }
                            if (prop.toLowerCase() === 'password') {
                                if (session.config.data.storage.password !== args.options[prop]) {
                                    Globals.success(`Updated '${(prop)}' with value ${(args.options[prop])}.`);
                                    l.append('update', `'${(prop)}' with value ${(args.options[prop])}.`);
                                }

                                session.config.data.storage.password = args.options[prop];
                            }
                        }
                        session.config.save();
                        l.append('status', 'success');
                    }
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
            });
        });

};