"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JSONBig = require("json-bigint");
const ASCIITable = require("ascii-table");
const globals_1 = require("../utils/globals");
function commandInfo(evmlc, session) {
    return evmlc.command('info')
        .description('Prints information about node as JSON or --formatted.')
        .option('-f, --formatted', 'format output')
        .action((args) => {
        return new Promise(resolve => {
            let formatted = args.options.formatted || false;
            session.connect()
                .then((connection) => {
                connection.api.getInfo()
                    .then((res) => {
                    if (formatted) {
                        let information = JSONBig.parse(res);
                        let table = new ASCIITable('Info');
                        Object.keys(information).forEach(function (key) {
                            table.addRow(key, information[key]);
                        });
                        globals_1.success(table.toString());
                        resolve();
                    }
                    else {
                        globals_1.success(res);
                        resolve();
                    }
                })
                    .catch(err => globals_1.error(err));
            })
                .catch(err => globals_1.error(err));
        });
    })
        .description('Testing purposes.');
}
exports.default = commandInfo;
;
