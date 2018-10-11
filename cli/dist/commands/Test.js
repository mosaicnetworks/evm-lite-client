"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function commandTest(evmlc, session) {
    return evmlc.command('test').alias('test')
        .hidden()
        .action((args) => {
        return new Promise(resolve => {
        });
    })
        .description('Testing purposes.');
}
exports.default = commandTest;
;
