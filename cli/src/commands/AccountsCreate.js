"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer = require("inquirer");
const fs = require("fs");
const JSONBig = require("json-bigint");
const Globals_1 = require("../utils/Globals");
const Keystore_1 = require("../classes/Keystore");
function commandAccountsCreate(evmlc, session) {
    let description = 'Allows you to create and encrypt accounts locally. Created accounts will either be placed in the' +
        ' keystore folder inside the data directory provided by the global --datadir, -d flag or if no flag is' +
        ' provided, in the keystore specified in the configuration file.';
    return evmlc.command('accounts create').alias('a c')
        .description(description)
        .option('-o, --output <path>', 'keystore file output path')
        .option('-v, --verbose', 'show verbose output')
        .option('-p, --password <file_path>', 'password file path')
        .types({
        string: ['p', 'password', 'o', 'output']
    })
        .action((args) => {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            let interactive = !args.options.password || session.interactive;
            let verbose = args.options.verbose || false;
            let questions = [
                {
                    name: 'output',
                    message: 'Enter keystore output path: ',
                    default: session.keystore.path,
                    type: 'input'
                },
                {
                    name: 'password',
                    message: 'Enter a password: ',
                    type: 'password'
                },
                {
                    name: 'verifyPassword',
                    message: 'Re-enter password: ',
                    type: 'password'
                }
            ];
            if (interactive) {
                let { output, password, verifyPassword } = yield inquirer.prompt(questions);
                if (!(password && verifyPassword && (password === verifyPassword))) {
                    Globals_1.default.error('Error: Passwords either blank or do not match.');
                    resolve();
                    return;
                }
                if (!fs.existsSync(output)) {
                    Globals_1.default.error('Error: Output directory does not exist.');
                    resolve();
                    return;
                }
                if (!fs.lstatSync(output).isDirectory()) {
                    Globals_1.default.error('Error: Output path is not a directory.');
                    resolve();
                    return;
                }
                args.options.password = password;
                args.options.output = output;
            }
            else {
                args.options.output = args.options.output || session.config.data.storage.keystore;
                if (!fs.existsSync(args.options.password) || !fs.existsSync(args.options.output)) {
                    Globals_1.default.error('Output path or password file path provided does not exist.');
                    resolve();
                    return;
                }
                if (fs.lstatSync(args.options.password).isDirectory()) {
                    Globals_1.default.error('Password file path provided is a directory.');
                    resolve();
                    return;
                }
                if (!fs.existsSync(args.options.output)) {
                    Globals_1.default.error('Error: Output directory does not exist.');
                    resolve();
                    return;
                }
                if (!fs.lstatSync(args.options.output).isDirectory()) {
                    Globals_1.default.error('Error: Output path is not a directory.');
                    resolve();
                    return;
                }
                args.options.password = fs.readFileSync(args.options.password);
            }
            let password = args.options.password;
            let output = args.options.output;
            let sAccount = Keystore_1.default.create(output, password);
            let account = JSONBig.parse(sAccount);
            if (!verbose) {
                Globals_1.default.success(`Address: ${account.address}`);
            }
            else {
                Globals_1.default.success(sAccount);
            }
            resolve();
        }));
    });
}
exports.default = commandAccountsCreate;
;
