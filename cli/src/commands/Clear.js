"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function commandClear(evmlc, session) {
    return evmlc.command('clear')
        .description('Clears interactive mode output output.')
        .action((args) => {
        return new Promise((resolve) => {
            process.stdout.write("\u001B[2J\u001B[0;0f");
            resolve();
        });
    });
}
exports.default = commandClear;
;
