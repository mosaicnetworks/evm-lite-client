"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

function commandInteractive(evmlc) {
    return evmlc.command('interactive').alias('i')
        .option('-c, --config <path>', 'set config file path')
        .action((args) => {
        return new Promise(resolve => resolve());
    })
        .description('Enter interactive mode.');
}
exports.default = commandInteractive;
;
