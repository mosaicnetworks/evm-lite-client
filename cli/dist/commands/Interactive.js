"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function commandInteractive(evmlc, config) {
    return evmlc.command('interactive').alias('i')
        .action((args) => {
        return new Promise(resolve => resolve());
    })
        .description('Enter interactive mode.');
}
exports.default = commandInteractive;
;
