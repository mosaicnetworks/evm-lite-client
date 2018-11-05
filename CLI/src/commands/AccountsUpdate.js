"use strict";
/**
 * @file AccountsCreate.ts
 * @author Mosaic Networks <https://github.com/mosaicnetworks>
 * @date 2018
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const inquirer = require("inquirer");
const JSONBig = require("json-bigint");
const Library_1 = require("../../../Library");
const Staging_1 = require("../classes/Staging");
/**
 * Should return either a Staged error or success.
 *
 * @remarks
 * This staging function will parse all the arguments of the `accounts update` command
 * and resolve a success or an error.
 *
 * @param args - Arguments to the command.
 * @param session - Controls the session of the CLI instance.
 * @returns An object specifying a success or an error.
 *
 * @alpha
 */
exports.stage = (args, session) => {
    return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
        const { error, success } = Staging_1.default.getStagingFunctions(args);
        const interactive = args.options.interactive || session.interactive;
        const accounts = yield session.keystore.all();
        const addressQ = [
            {
                choices: accounts.map((account) => account.address),
                message: 'Address: ',
                name: 'address',
                type: 'list'
            }
        ];
        const passwordQ = [
            {
                message: 'Enter current password: ',
                name: 'password',
                type: 'password'
            }
        ];
        const newPasswordQ = [
            {
                message: 'Enter a new password: ',
                name: 'password',
                type: 'password',
            },
            {
                message: 'Re-enter new password: ',
                name: 'verifyPassword',
                type: 'password',
            }
        ];
        if (interactive && !args.address) {
            const { address } = yield inquirer.prompt(addressQ);
            args.address = address;
        }
        if (!args.address) {
            resolve(error(Staging_1.default.ERRORS.BLANK_FIELD, 'Provide a non-empty address.'));
            return;
        }
        const keystore = session.keystore.get(args.address);
        if (!keystore) {
            resolve(error(Staging_1.default.ERRORS.FILE_NOT_FOUND, `Cannot find keystore file of address.`));
            return;
        }
        if (!args.options.old) {
            const { password } = yield inquirer.prompt(passwordQ);
            args.options.old = password.trim();
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
            args.options.old = fs.readFileSync(args.options.old, 'utf8').trim();
        }
        let decrypted = null;
        try {
            decrypted = Library_1.Account.decrypt(keystore, args.options.old);
        }
        catch (err) {
            resolve(error(Staging_1.default.ERRORS.DECRYPTION, 'Failed decryption of account with the password provided.'));
            return;
        }
        if (!args.options.new) {
            const { password, verifyPassword } = yield inquirer.prompt(newPasswordQ);
            if (!(password && verifyPassword && (password === verifyPassword))) {
                resolve(error(Staging_1.default.ERRORS.BLANK_FIELD, 'Passwords either blank or do not match.'));
                return;
            }
            args.options.new = password.trim();
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
            args.options.new = fs.readFileSync(args.options.new, 'utf8').trim();
        }
        if (args.options.old === args.options.new) {
            resolve(error(Staging_1.default.ERRORS.OTHER, 'New password is the same as old.'));
            return;
        }
        const newKeystore = decrypted.encrypt(args.options.new);
        fs.writeFileSync(session.keystore.find(args.address), JSONBig.stringify(newKeystore));
        resolve(success(newKeystore));
    }));
};
/**
 * Should construct a Vorpal.Command instance for the command `accounts update`.
 *
 * @remarks
 * Allows you to update the password of a `V3JSONKeystore` file if the the previous password
 * is known.
 *
 * Usage: `accounts update 0x583560ee73713a6554c463bd02349841cd79f6e2 --old ~/oldpwd.txt --new ~/newpwd.txt`
 *
 * Here we have written a command to change the password from the contents `oldpwd.txt` to the contents
 * of `newpwd.txt` for the account `0x583560ee73713a6554c463bd02349841cd79f6e2`.
 *
 * @param evmlc - The CLI instance.
 * @param session - Controls the session of the CLI instance.
 * @returns The Vorpal.Command instance of `accounts get`.
 *
 * @alpha
 */
function commandAccountsUpdate(evmlc, session) {
    const description = 'Update the password for a local account. Previous password must be known.';
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
