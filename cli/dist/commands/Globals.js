"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer = require("inquirer");
const evmlc_1 = require("../evmlc");
const functions_1 = require("../utils/functions");
/**
 * Should return a Vorpal command instance used for updating the config file.
 *
 * @param {Vorpal} evmlc - The command line object.
 * @param {Object} config - A JSON of the TOML config file.
 * @returns Vorpal Command instance
 */
function commandGlobals(evmlc, config) {
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
        .action((args) => {
        return new Promise(resolve => {
            // handles updating config file
            let handleGlobals = () => {
                for (let prop in args.options) {
                    if (prop.toLowerCase() === 'host') {
                        functions_1.success(`Updated '${(prop)}' with value ${(args.options[prop])}.`);
                        config.connection.host = args.options[prop];
                    }
                    if (prop.toLowerCase() === 'port') {
                        functions_1.success(`Updated '${(prop)}' with value ${(args.options[prop])}.`);
                        config.connection.port = args.options[prop];
                    }
                    if (prop.toLowerCase() === 'from') {
                        functions_1.success(`Updated '${(prop)}' with value ${(args.options[prop])}.`);
                        config.defaults.from = args.options[prop];
                    }
                    if (prop.toLowerCase() === 'gas') {
                        functions_1.success(`Updated '${(prop)}' with value ${(args.options[prop])}.`);
                        config.defaults.gas = args.options[prop];
                    }
                    if (prop.toLowerCase() === 'gasprice') {
                        functions_1.success(`Updated '${(prop)}' with value ${(args.options[prop])}.`);
                        config.defaults.gasPrice = args.options[prop];
                    }
                }
                evmlc_1.updateToConfigFile(config);
            };
            let i = args.options.interactive || evmlc_1.interactive;
            let questions = [
                {
                    name: 'host',
                    default: config.connection.host,
                    type: 'input',
                    message: 'Host: '
                },
                {
                    name: 'port',
                    default: config.connection.port,
                    type: 'input',
                    message: 'Port: '
                },
                {
                    name: 'from',
                    default: config.defaults.from,
                    type: 'input',
                    message: 'Default From Address: '
                },
                {
                    name: 'gas',
                    default: config.defaults.gas,
                    type: 'input',
                    message: 'Default Gas: '
                },
                {
                    name: 'gasPrice',
                    default: config.defaults.gasPrice,
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
            }
            else {
                // if not interactive
                handleGlobals();
                resolve();
            }
        });
    });
}
exports.default = commandGlobals;
;
