"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function commandInteractive(evmlc, session) {
    const description = 'Enter into interactive mode with data directory provided by --datadir, -d or default.';
    return evmlc.command('interactive').alias('i')
        .description(description)
        .action(() => {
        return new Promise(resolve => resolve());
    });
}
exports.default = commandInteractive;
;
