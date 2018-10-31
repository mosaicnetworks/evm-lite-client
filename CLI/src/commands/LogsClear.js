"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const Globals_1 = require("../utils/Globals");
function commandLogsClear(evmlc, session) {
    return evmlc.command('logs clear').alias('l c')
        .description('Clears log information.')
        .hidden()
        .action((args) => {
        return new Promise((resolve) => {
            fs.writeFileSync(session.logpath, '');
            Globals_1.default.success('Logs cleared.');
            resolve();
        });
    });
}
exports.default = commandLogsClear;
;
