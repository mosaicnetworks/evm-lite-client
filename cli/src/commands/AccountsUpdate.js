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
const lib_1 = require("../../../lib");
const Staging_1 = require("../classes/Staging");
exports.stage = (args, session) => {
    return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
        let { error, success } = Staging_1.default.getStagingFunctions(args);
        let interactive = args.options.interactive || session.interactive;
        let accounts = yield session.keystore.all();
        let addressQ = [
            {
                name: 'address',
                type: 'list',
                message: 'Address: ',
                choices: accounts.map((account) => account.address)
            }
        ];
        let passwordQ = [
            {
                name: 'password',
                type: 'password',
                message: 'Enter password: ',
            }
        ];
        let newPasswordQ = [
            {
                name: 'password',
                type: 'password',
                message: 'Enter a new password: ',
            },
            {
                name: 'verifyPassword',
                type: 'password',
                message: 'Re-enter new password: ',
            }
        ];
        if (interactive && !args.address) {
            let { address } = yield inquirer.prompt(addressQ);
            args.address = address;
        }
        if (!args.address) {
            resolve(error(Staging_1.default.ERRORS.BLANK_FIELD, 'Provide a non-empty address.'));
            return;
        }
        let keystore = session.keystore.get(args.address);
        if (!keystore) {
            resolve(error(Staging_1.default.ERRORS.FILE_NOT_FOUND, `Cannot find keystore file of address.`));
            return;
        }
        if (!args.options.old) {
            let { password } = yield inquirer.prompt(passwordQ);
            args.options.old = password;
        }
        else {
            if (!Staging_1.default.exists(args.options.old)) {
                resolve(error(Staging_1.default.ERRORS.FILE_NOT_FOUND, 'Old password file path provided does not exist.'));
                return;
            }
            if (Staging_1.default.isDirectory(args.options.old)) {
                resolve(error(Staging_1.default.ERRORS.IS_DIRECTORY, 'Old password file path provided is not a file.'));
                return;
            }
            args.options.old = fs.readFileSync(args.options.old, 'utf8');
        }
        let decrypted = null;
        try {
            decrypted = lib_1.Account.decrypt(keystore, args.options.old);
        }
        catch (err) {
            resolve(error(Staging_1.default.ERRORS.OTHER, 'Failed decryption of account with the password provided.'));
            return;
        }
        if (!args.options.new) {
            let { password, verifyPassword } = yield inquirer.prompt(newPasswordQ);
            if (!(password && verifyPassword && (password === verifyPassword))) {
                resolve(error(Staging_1.default.ERRORS.BLANK_FIELD, 'Passwords either blank or do not match.'));
                return;
            }
            args.options.new = password;
        }
        else {
            if (!Staging_1.default.exists(args.options.new)) {
                resolve(error(Staging_1.default.ERRORS.FILE_NOT_FOUND, 'New password file path provided does not exist.'));
                return;
            }
            if (Staging_1.default.isDirectory(args.options.new)) {
                resolve(error(Staging_1.default.ERRORS.IS_DIRECTORY, 'New password file path provided is not a file.'));
                return;
            }
            args.options.new = fs.readFileSync(args.options.new, 'utf8');
        }
        if (args.options.old === args.options.new) {
            resolve(error(Staging_1.default.ERRORS.OTHER, 'New password is the same as old.'));
            return;
        }
        let newKeystore = decrypted.encrypt(args.options.new);
        fs.writeFileSync(session.keystore.find(args.address), JSONBig.stringify(newKeystore));
        resolve(success(newKeystore));
    }));
};
function commandAccountsUpdate(evmlc, session) {
    let description = 'Update the password for a local account. Previous password must be known.';
    return evmlc.command('accounts update [address]').alias('a u')
        .description(description)
        .option('-i, --interactive', 'use interactive mode')
        .option('-o, --old <path>', 'old password file path')
        .option('-n, --new <path>', 'new password file path')
        .types({
        string: ['_', 'old', 'o', 'n', 'new']
    })
        .action((args) => Staging_1.execute(exports.stage, args, session));
}
exports.default = commandAccountsUpdate;
;
