import * as Vorpal from "vorpal";
import * as inquirer from 'inquirer';

import {interactive} from "../evmlc";
import {success} from "../utils/functions";

import UserConfig from "../utils/UserConfig";


/**
 * Should return a Vorpal command instance used for updating the config file.
 *
 * @param {Vorpal} evmlc - The command line object.
 * @param {Object} config - A JSON of the TOML config file.
 * @returns Vorpal Command instance
 */

export default function commandGlobals(evmlc: Vorpal, config: UserConfig) {

    return evmlc.command('globals ').alias('g')
        .description('Set default global values.')
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

                let i = args.options.interactive || interactive;
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

                if (i) {

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

                    // if not interactive
                    handleGlobals();
                    resolve();

                }

            });

        });

};