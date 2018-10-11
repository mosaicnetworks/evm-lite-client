"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("../utils/globals");
function commandConfigUser(evmlc, session) {
    let description = 'Output current configuration file as JSON.';
    return evmlc.command('config view').alias('c v')
        .description(description)
        .action(() => {
        return new Promise(resolve => {
            try {
                globals_1.success(session.config.toTOML());
            }
            catch (err) {
                (typeof err === 'object') ? console.log(err) : globals_1.error(err);
            }
            resolve();
        });
    });
}
exports.default = commandConfigUser;
;
