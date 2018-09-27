"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
const evmlc_1 = require("../evmlc");

function commandGlobals(evmlc, config) {
    return evmlc.command('globals ').alias('g')
        .description('set default global values')
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
                        config.connection.host = args.options[prop];
                        evmlc_1.updateToConfigFile();
                    }
                    if (prop.toLowerCase() === 'port') {
                        config.connection.port = args.options[prop];
                        evmlc_1.updateToConfigFile();
                    }
                }
                resolve();
            });
        });
}

exports.default = commandGlobals;
;
