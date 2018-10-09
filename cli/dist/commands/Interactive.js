"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function commandInteractive(evmlc) {
    let description = `Enter into interactive mode with default configuration or the one provided with -c, --config.`;
    return evmlc.command('interactive').alias('i')
        .description(description)
        .option('-c, --config <path>', 'set config file path')
        .action((args) => {
        return new Promise(resolve => resolve());
    });
}
exports.default = commandInteractive;
;
