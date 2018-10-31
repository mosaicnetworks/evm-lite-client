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
const Staging_1 = require("../classes/Staging");
const Keystore_1 = require("../classes/Keystore");
exports.stage = (args, session) => {
    return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
        let { error, success } = Staging_1.default.getStagingFunctions(args);
        let interactive = !args.options.pwd || session.interactive;
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
                resolve(error(Staging_1.default.ERRORS.BLANK_FIELD, 'Passwords either blank or do not match.'));
                return;
            }
            args.options.pwd = password;
            args.options.output = output;
        }
        else {
            if (!Staging_1.default.exists(args.options.pwd)) {
                resolve(error(Staging_1.default.ERRORS.PATH_NOT_EXIST, 'Password file provided does not exist.'));
                return;
            }
            if (Staging_1.default.isDirectory(args.options.pwd)) {
                resolve(error(Staging_1.default.ERRORS.IS_DIRECTORY, 'Password file path provided is a directory.'));
                return;
            }
            args.options.pwd = fs.readFileSync(args.options.pwd, 'utf8').trim();
        }
        args.options.output = args.options.output || session.config.data.defaults.keystore;
        if (!Staging_1.default.exists(args.options.output)) {
            resolve(error(Staging_1.default.ERRORS.DIRECTORY_NOT_EXIST, 'Output directory does not exist.'));
            return;
        }
        if (!Staging_1.default.isDirectory(args.options.output)) {
            resolve(error(Staging_1.default.ERRORS.IS_FILE, 'Output path is not a directory.'));
            return;
        }
        let account = JSONBig.parse(Keystore_1.default.create(args.options.output, args.options.pwd));
        resolve(success(verbose ? account : `0x${account.address}`));
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
        .option('--pwd <file_path>', 'password file path')
        .types({
        string: ['pwd', 'o', 'output']
    })
        .action((args) => Staging_1.execute(exports.stage, args, session));
}
exports.default = commandAccountsCreate;
;
