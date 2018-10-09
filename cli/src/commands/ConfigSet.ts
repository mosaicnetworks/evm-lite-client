import * as Vorpal from "vorpal";
import * as inquirer from 'inquirer';

import {getConfig, getInteractive, success, warning} from "../utils/globals";


/**
 * Should return a Vorpal command instance used for updating the config file.
 *
 * @param {Vorpal} evmlc - The command line object.
 * @returns Vorpal Command instance
 */

export default function commandConfigUser(evmlc: Vorpal) {

    return evmlc.command('config set').alias('c s')
        .description('Set config values.')
        .option('-i, --interactive', 'enter into interactive command')
        .option('-h, --host <host>', 'default host')
        .option('-p, --port <port>', 'default port')
        .option('--from <from>', 'default from')
        .option('--gas <gas>', 'default gas')
        .option('--gasprice <gasprice>', 'gas price')
        .option('-c, --config <path>', 'set config file path')
        .option('--keystore <path>', 'keystore path')
        .option('--pwd <path>', 'password path')
        .types({
            string: ['h', 'host', 'from', 'keystore', 'pwd', 'config']
        })
        .action((args: Vorpal.Args): Promise<void> => {

            return new Promise<void>(resolve => {

                let config = getConfig(args.options.config);
                let interactive = getInteractive(args.options.interactive);

                // handles updating config file
                let handleGlobals = (): void => {
                    for (let prop in args.options) {
                        if (prop.toLowerCase() === 'host') {
                            if (config.data.connection.host !== args.options[prop])
                                success(`Updated '${(prop)}' with value ${(args.options[prop])}.`);

                            config.data.connection.host = args.options[prop];
                        }
                        if (prop.toLowerCase() === 'port') {
                            if (config.data.connection.port !== args.options[prop])
                                success(`Updated '${(prop)}' with value ${(args.options[prop])}.`);

                            config.data.connection.port = args.options[prop];
                        }
                        if (prop.toLowerCase() === 'from') {
                            if (config.data.defaults.from !== args.options[prop])
                                success(`Updated '${(prop)}' with value ${(args.options[prop])}.`);

                            config.data.defaults.from = args.options[prop];
                        }
                        if (prop.toLowerCase() === 'gas') {
                            if (config.data.defaults.gas !== args.options[prop])
                                success(`Updated '${(prop)}' with value ${(args.options[prop])}.`);

                            config.data.defaults.gas = args.options[prop];
                        }
                        if (prop.toLowerCase() === 'gasprice') {
                            if (config.data.defaults.gasPrice !== args.options[prop])
                                success(`Updated '${(prop)}' with value ${(args.options[prop])}.`);

                            config.data.defaults.gasPrice = args.options[prop];
                        }
                    }

                    config.save();
                };

                let questions = [
                    {
                        name: 'host',
                        default: config.data.connection.host,
                        type: 'input',
                        message: 'Host: '
                    },
                    {
                        name: 'port',
                        default: config.data.connection.port,
                        type: 'input',
                        message: 'Port: '
                    },
                    {
                        name: 'from',
                        default: config.data.defaults.from,
                        type: 'input',
                        message: 'Default From Address: '
                    },
                    {
                        name: 'gas',
                        default: config.data.defaults.gas,
                        type: 'input',
                        message: 'Default Gas: '
                    },
                    {
                        name: 'gasPrice',
                        default: config.data.defaults.gasPrice,
                        type: 'input',
                        message: 'Default Gas Price: '
                    },
                ];

                if (interactive) {

                    // interactive mode
                    inquirer.prompt(questions)
                        .then((answers) => {
                            args.options.host = answers.host;
                            args.options.port = answers.port;
                            args.options.from = answers.from;
                            args.options.gas = answers.gas;
                            args.options.gasprice = answers.gasPrice;
                        })
                        .then(() => {
                            handleGlobals();
                            resolve();
                        });

                } else {
                    if (Object.keys(args.options).length) {
                        handleGlobals();
                        resolve();
                    } else {
                        warning('No options provided. To enter interactive mode use: -i, --interactive.');
                    }
                }

            });

        });

};