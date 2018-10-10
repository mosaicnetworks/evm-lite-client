"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function commandConfigUser(evmlc, session) {
    let description = 'Output current configuration file as JSON.';
    return evmlc.command('config view').alias('c v')
        .description(description)
        .action((args) => {
        return new Promise(resolve => {
            console.log(session.config.data);
            resolve();
        });
    });
}
exports.default = commandConfigUser;
;
