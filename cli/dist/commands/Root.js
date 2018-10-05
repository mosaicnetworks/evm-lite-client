"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function commandRoot(evmlc, config) {
    return evmlc.command('')
        .option('--interactive', 'enter interactive mode')
        .action((args) => {
        return new Promise(resolve => {
            if (args.options.interactive) {
                console.log('yes');
            }
            else {
                console.log('ig');
            }
            resolve();
        });
    });
}
exports.default = commandRoot;
;
