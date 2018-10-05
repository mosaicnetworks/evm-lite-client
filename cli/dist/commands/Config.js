"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function commandConfig(evmlc, config) {
    return evmlc.command('config').alias('c')
        .description('Show config JSON.')
        .action(() => {
        return new Promise(resolve => {
            console.log(config);
            resolve();
        });
    });
}
exports.default = commandConfig;
;
