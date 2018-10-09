"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function commandTest(evmlc) {
    return evmlc.command('test').alias('test')
        .option('-c, --config <path>', 'set config file path')
        .hidden()
        .action((args) => {
        return new Promise(resolve => {
            let string = '/Users/danu/.evmlc/config/config.toml';
            let res = string.split('/');
            res.pop();
            let strin2 = res.join('/');
            console.log(strin2);
            resolve();
        });
    })
        .description('Testing purposes.');
}
exports.default = commandTest;
;
