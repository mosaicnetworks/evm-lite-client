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
const Globals_1 = require("../utils/Globals");
function commandAccountsUpdate(evmlc, session) {
    let description = 'Update the password for a local account. Previous password must be known.';
    return evmlc.command('accounts update [address]').alias('a u')
        .description(description)
        .option('-i, --interactive', 'use interactive mode')
        .option('-o, --old <path>', 'old password file path')
        .option('-n, --new <path>', 'new password file path')
        .types({
        string: ['_', 'p', 'password']
    })
        .action((args) => {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
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
                Globals_1.default.error('Provide a non-empty address. Usage: accounts update <address>');
                resolve();
                return;
            }
            let keystore = session.keystore.get(args.address);
            if (!keystore) {
                Globals_1.default.error(`Cannot find keystore file of address: ${args.address}.`);
            }
            if (args.options.old) {
                if (!fs.existsSync(args.options.old)) {
                    Globals_1.default.error('Old password file path provided does not exist.');
                    resolve();
                    return;
                }
                if (fs.lstatSync(args.options.old).isDirectory()) {
                    Globals_1.default.error('Old password file path provided is not a file.');
                    resolve();
                    return;
                }
                args.options.password = fs.readFileSync(args.options.password, 'utf8');
            }
            else {
                let { password } = yield inquirer.prompt(passwordQ);
                args.options.old = password;
            }
            let decrypted = null;
            try {
                decrypted = lib_1.Account.decrypt(keystore, args.options.old);
            }
            catch (err) {
                Globals_1.default.error('Failed decryption of account with the password provided.');
                resolve();
                return;
            }
            if (!decrypted) {
                Globals_1.default.error('Oops! Something went wrong.');
                resolve();
                return;
            }
            if (args.options.new) {
                if (!fs.existsSync(args.options.new)) {
                    Globals_1.default.error('New password file path provided does not exist.');
                    resolve();
                    return;
                }
                if (fs.lstatSync(args.options.old).isDirectory()) {
                    Globals_1.default.error('New password file path provided is not a file.');
                    resolve();
                    return;
                }
                args.options.new = fs.readFileSync(args.options.password, 'utf8');
            }
            else {
                let { password, verifyPassword } = yield inquirer.prompt(newPasswordQ);
                if (!(password && verifyPassword && (password === verifyPassword))) {
                    Globals_1.default.error('Error: Passwords either blank or do not match.');
                    resolve();
                    return;
                }
                args.options.new = password;
            }
            if (args.options.old === args.options.new) {
                Globals_1.default.error('New password is the same as old.');
                resolve();
                return;
            }
            let filePath = session.keystore.find(args.address);
            let nKeystore = decrypted.encrypt(args.options.new);
            let sNKeystore = JSONBig.stringify(nKeystore);
            fs.writeFileSync(filePath, sNKeystore);
            Globals_1.default.success(sNKeystore);
            resolve();
        }));
    });
}
exports.default = commandAccountsUpdate;
;
