"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
const globals_1 = require("../utils/globals");

/**
 * Should return a Vorpal command instance used for viewing the config file.
 *
 * @param {Vorpal} evmlc - The command line object.
 * @returns Vorpal Command instance
 */
function commandConfigUser(evmlc) {
    return evmlc.command('config view').alias('c v')
        .description('View config file.')
        .option('-c, --config <path>', 'set config file path')
        .types({
            string: ['config']
        })
        .action((args) => {
            return new Promise(resolve => {
                let config = globals_1.getConfig(args.options.config);
                console.log(config.data);
                resolve();
            });
        });
}

exports.default = commandConfigUser;
;
