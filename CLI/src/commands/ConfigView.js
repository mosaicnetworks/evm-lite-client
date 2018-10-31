"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Staging_1 = require("../classes/Staging");
exports.stage = (args, session) => {
    return new Promise((resolve) => {
        let { error, success } = Staging_1.default.getStagingFunctions(args);
        let message = `Config file location: ${session.config.path} \n\n` + session.config.toTOML();
        resolve(success(message));
    });
};
function commandConfigUser(evmlc, session) {
    let description = 'Output current configuration file as JSON.';
    return evmlc.command('config view').alias('c v')
        .description(description)
        .action((args) => Staging_1.execute(exports.stage, args, session));
}
exports.default = commandConfigUser;
;
