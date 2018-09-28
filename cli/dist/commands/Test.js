"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function commandAccountsCreate(evmlc, config) {
    return evmlc.command('test').alias('test')
        .action((args) => {
        return new Promise(resolve => resolve());
    })
        .description('Testing purposes.');
}
exports.default = commandAccountsCreate;
;
