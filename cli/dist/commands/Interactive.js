"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function commandInteractive(evmlc, config) {
    return evmlc.command('interactive').alias('i')
        .action((args) => {
        return new Promise(() => {
            evmlc.delimiter('evmlc$').show();
        });
    })
        .description('Enter interactive mode.');
}
exports.default = commandInteractive;
;
