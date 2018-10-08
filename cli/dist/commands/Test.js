"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("../utils/functions");
function commandTest(evmlc, config) {
    return evmlc.command('test').alias('test')
        .action((args) => {
        return new Promise(resolve => {
            let A = {
                hello: 'hello',
                danu: {
                    asd: 1,
                    asd1: 2,
                    danu1: {
                        cc: 1,
                        ss: 22
                    }
                }
            };
            let B = {
                hello: 'hello',
                danu: {
                    asd: 1,
                    asd1: 2,
                    danu1: {
                        cc: 1,
                        ss: 2
                    }
                }
            };
            console.log(functions_1.isEquivalentObjects(A, B));
            resolve();
        });
    })
        .description('Testing purposes.');
}
exports.default = commandTest;
;
