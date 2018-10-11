import * as Vorpal from "vorpal";
import * as inquirer from 'inquirer';

import {error, success} from "../utils/globals";

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
            return new Promise<void>(resolve => {
                let interactive = args.options.interactive || session.interactive;
                let questions = [
                    {
                        name: 'host',
                        default: session.config.data.connection.host,
                        type: 'input',
                        message: 'Host: '
                    },
                    {
                        name: 'port',
                        default: session.config.data.connection.port,
                        type: 'input',
                        message: 'Port: '
                    },
                    {
                        name: 'from',
                        default: session.config.data.defaults.from,
                        type: 'input',
                        message: 'Default From Address: '
                    },
                    {
                        name: 'gas',
                        default: session.config.data.defaults.gas,
                        type: 'input',
                        message: 'Default Gas: '
                    },
                    {
                        name: 'gasPrice',
                        default: session.config.data.defaults.gasPrice,
                        type: 'input',
                        message: 'Default Gas Price: '
                    },
                ];
                let handleConfig = (): void => {
                    for (let prop in args.options) {
                        if (prop.toLowerCase() === 'host') {
                            if (session.config.data.connection.host !== args.options[prop])
                                success(`Updated '${(prop)}' with value ${(args.options[prop])}.`);

                            session.config.data.connection.host = args.options[prop];
                        }
                        if (prop.toLowerCase() === 'port') {
                            if (session.config.data.connection.port !== args.options[prop])
                                success(`Updated '${(prop)}' with value ${(args.options[prop])}.`);

                            session.config.data.connection.port = args.options[prop];
                        }
                        if (prop.toLowerCase() === 'from') {
                            if (session.config.data.defaults.from !== args.options[prop])
                                success(`Updated '${(prop)}' with value ${(args.options[prop])}.`);

                            session.config.data.defaults.from = args.options[prop];
                        }
                        if (prop.toLowerCase() === 'gas') {
                            if (session.config.data.defaults.gas !== args.options[prop])
                                success(`Updated '${(prop)}' with value ${(args.options[prop])}.`);

                            session.config.data.defaults.gas = args.options[prop];
                        }
                        if (prop.toLowerCase() === 'gasprice') {
                            if (session.config.data.defaults.gasPrice !== args.options[prop])
                                success(`Updated '${(prop)}' with value ${(args.options[prop])}.`);

                            session.config.data.defaults.gasPrice = args.options[prop];
                        }
                    }
                    session.config.save();
                };

                if (interactive) {
                    inquirer.prompt(questions)
                        .then((answers) => {
                            args.options.host = answers.host;
                            args.options.port = answers.port;
                            args.options.from = answers.from;
                            args.options.gas = answers.gas;
                            args.options.gasprice = answers.gasPrice;
                        })
                        .then(() => {
                            handleConfig();
                            resolve();
                        });
                } else {
                    if (Object.keys(args.options).length) {
                        handleConfig();
                        resolve();
                    } else {
                        error('No options provided. To enter interactive mode use: -i, --interactive.');
                        resolve();
                    }
                }
            });
        });

};