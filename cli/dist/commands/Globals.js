"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const evmlc_1 = require("../evmlc");
const functions_1 = require("../utils/functions");
function commandGlobals(evmlc, config) {
    return evmlc.command('globals ').alias('g')
        .description('Set default global values.')
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
            evmlc_1.updateToConfigFile();
            resolve();
        });
    });
}
exports.default = commandGlobals;
;
