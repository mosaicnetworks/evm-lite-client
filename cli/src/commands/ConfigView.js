"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Globals_1 = require("../utils/Globals");
function commandConfigUser(evmlc, session) {
    let description = 'Output current configuration file as JSON.';
    return evmlc.command('config view').alias('c v')
        .description(description)
        .action(() => {
        return new Promise(resolve => {
            try {
                Globals_1.default.info(`Config file location: ${session.config.path}`);
                Globals_1.default.success(session.config.toTOML());
            }
            catch (err) {
                (typeof err === 'object') ? console.log(err) : Globals_1.default.error(err);
            }
            resolve();
        });
    });
}
exports.default = commandConfigUser;
;
