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
const Staging_1 = require("../utils/Staging");
const Keystore_1 = require("../classes/Keystore");
exports.stage = (args, session) => {
    return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
        let o = Staging_1.default.construct.bind(null, args);
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
                resolve(o(Staging_1.default.ERROR, Staging_1.default.SUBTYPES.errors.BLANK_FIELD, 'Passwords either blank or do not match.'));
                return;
            }
            if (!fs.existsSync(output)) {
                resolve(o(Staging_1.default.ERROR, Staging_1.default.SUBTYPES.errors.DIRECTORY_NOT_EXIST, 'Output directory does not exist.'));
                return;
            }
            if (!fs.lstatSync(output).isDirectory()) {
                resolve(o(Staging_1.default.ERROR, Staging_1.default.SUBTYPES.errors.IS_FILE, 'Output path is not a directory.'));
                return;
            }
            args.options.password = password;
            args.options.output = output;
        }
        else {
            args.options.output = args.options.output || session.config.data.storage.keystore;
            if (!fs.existsSync(args.options.password)) {
                resolve(o(Staging_1.default.ERROR, Staging_1.default.SUBTYPES.errors.PATH_NOT_EXIST, 'Password file provided does not exist.'));
                return;
            }
            if (!fs.existsSync(args.options.output)) {
                resolve(o(Staging_1.default.ERROR, Staging_1.default.SUBTYPES.errors.DIRECTORY_NOT_EXIST, 'Output directory provided does not exist.'));
                return;
            }
            if (fs.lstatSync(args.options.password).isDirectory()) {
                resolve(o(Staging_1.default.ERROR, Staging_1.default.SUBTYPES.errors.IS_DIRECTORY, 'Password file path provided is a directory.'));
                return;
            }
            if (!fs.lstatSync(args.options.output).isDirectory()) {
                resolve(o(Staging_1.default.ERROR, Staging_1.default.SUBTYPES.errors.IS_FILE, 'Output path is not a directory.'));
                return;
            }
            args.options.password = fs.readFileSync(args.options.password, 'utf8');
        }
        let password = args.options.password;
        let output = args.options.output;
        let sAccount = Keystore_1.default.create(output, password);
        let account = JSONBig.parse(sAccount);
        let message = '';
        if (!verbose) {
            message = '0x' + account.address;
        }
        else {
            message = account;
        }
        resolve(o(Staging_1.default.SUCCESS, Staging_1.default.SUBTYPES.success.COMMAND_EXECUTION_COMPLETED, message));
    }));
};
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
        .action((args) => Staging_1.execute(exports.stage, args, session));
}
exports.default = commandAccountsCreate;
;
