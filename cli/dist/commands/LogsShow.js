"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const Globals_1 = require("../utils/Globals");
function commandLogsShow(evmlc, session) {
    return evmlc.command('logs show').alias('l s')
        .description('Prints log information to screen in plain text.')
        .action((args) => {
        return new Promise((resolve) => {
            try {
                Globals_1.default.info(fs.readFileSync(session.logpath, 'utf8'));
            }
            catch (err) {
                (typeof err === 'object') ? console.log(err) : Globals_1.default.error(err);
            }
            resolve();
        });
    });
}
exports.default = commandLogsShow;
;
