"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Globals_1 = require("../utils/Globals");
function commandConfigUser(evmlc, session) {
    let description = 'Output current configuration file as JSON.';
    return evmlc.command('config view').alias('c v')
        .description(description)
        .action(() => {
        return new Promise(resolve => {
            Globals_1.default.info(`Config file location: ${session.config.path}`);
            Globals_1.default.success(session.config.toTOML());
            resolve();
        });
    });
}
exports.default = commandConfigUser;
;
