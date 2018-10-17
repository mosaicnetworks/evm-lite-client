"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const Globals_1 = require("../utils/Globals");
function commandLogsShow(evmlc, session) {
    return evmlc.command('logs view').alias('l v')
        .description('Prints log information to screen in plain text.')
        .option('-s, --session', 'output session logs')
        .hidden()
        .action((args) => {
        return new Promise((resolve) => {
            try {
                let interactive = session.interactive || false;
                let current = args.options.session || false;
                if (current) {
                    if (interactive) {
                        for (let log of session.logs) {
                            log.show();
                        }
                    }
                    else {
                        Globals_1.default.warning('Cannot print session log when not in interactive mode.');
                    }
                }
                else {
                    Globals_1.default.info(fs.readFileSync(session.logpath, 'utf8'));
                }
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
