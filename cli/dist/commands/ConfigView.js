"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("../utils/globals");
function commandConfigUser(evmlc, session) {
    let description = 'Output current configuration file as JSON.';
    return evmlc.command('config view').alias('c v')
        .description(description)
        .action((args) => {
        return new Promise(resolve => {
            globals_1.success(session.config.toTOML());
            resolve();
        });
    });
}
exports.default = commandConfigUser;
;
