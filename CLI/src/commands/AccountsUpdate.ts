/**
 * @file AccountsCreate.ts
 * @author Mosaic Networks <https://github.com/mosaicnetworks>
 * @date 2018
 */

import * as Vorpal from "vorpal";
import * as inquirer from 'inquirer';
import * as fs from "fs";
import * as JSONBig from 'json-bigint';

import {Account} from "../../../Library"
import Staging, {execute, Message, StagedOutput, StagingFunction} from "../classes/Staging";

import Session from "../classes/Session";

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
export const stage: StagingFunction = (args: Vorpal.Args, session: Session): Promise<StagedOutput<Message>> => {
    return new Promise<StagedOutput<Message>>(async (resolve) => {
        let {error, success} = Staging.getStagingFunctions(args);

        let interactive = args.options.interactive || session.interactive;
        let accounts = await session.keystore.all();
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
                message: 'Enter current password: ',
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
            let {address} = await inquirer.prompt(addressQ);
            args.address = address;
        }

        if (!args.address) {
            resolve(error(Staging.ERRORS.BLANK_FIELD, 'Provide a non-empty address.'));
            return;
        }

        let keystore = session.keystore.get(args.address);
        if (!keystore) {
            resolve(error(Staging.ERRORS.FILE_NOT_FOUND, `Cannot find keystore file of address.`));
            return;
        }

        if (!args.options.old) {
            let {password} = await inquirer.prompt(passwordQ);
            args.options.old = password.trim();
        } else {
            if (!Staging.exists(args.options.old)) {
                resolve(error(Staging.ERRORS.FILE_NOT_FOUND, 'Old password file path provided does not exist.'));
                return;
            }

            if (Staging.isDirectory(args.options.old)) {
                resolve(error(Staging.ERRORS.IS_DIRECTORY, 'Old password file path provided is not a file.'));
                return;
            }

            args.options.old = fs.readFileSync(args.options.old, 'utf8').trim();
        }

        let decrypted: Account = null;
        try {
            decrypted = Account.decrypt(keystore, args.options.old);
        } catch (err) {
            resolve(error(
                Staging.ERRORS.DECRYPTION,
                'Failed decryption of account with the password provided.'
            ));
            return;
        }

        if (!args.options.new) {
            let {password, verifyPassword} = await inquirer.prompt(newPasswordQ);
            if (!(password && verifyPassword && (password === verifyPassword))) {
                resolve(error(Staging.ERRORS.BLANK_FIELD, 'Passwords either blank or do not match.'));
                return;
            }
            args.options.new = password.trim();
        } else {
            if (!Staging.exists(args.options.new)) {
                resolve(error(Staging.ERRORS.FILE_NOT_FOUND, 'New password file path provided does not exist.'));
                return;
            }

            if (Staging.isDirectory(args.options.new)) {
                resolve(error(Staging.ERRORS.IS_DIRECTORY, 'New password file path provided is not a file.'));
                return;
            }

            args.options.new = fs.readFileSync(args.options.new, 'utf8').trim();
        }

        if (args.options.old === args.options.new) {
            resolve(error(Staging.ERRORS.OTHER, 'New password is the same as old.'));
            return;
        }

        let newKeystore = decrypted.encrypt(args.options.new);

        fs.writeFileSync(session.keystore.find(args.address), JSONBig.stringify(newKeystore));
        resolve(success(newKeystore));
    })
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
export default function commandAccountsUpdate(evmlc: Vorpal, session: Session) {

    let description =
        'Update the password for a local account. Previous password must be known.';

    return evmlc.command('accounts update [address]').alias('a u')
        .description(description)
        .option('-i, --interactive', 'use interactive mode')
        .option('-o, --old <path>', 'old password file path')
        .option('-n, --new <path>', 'new password file path')
        .types({
            string: ['_', 'old', 'o', 'n', 'new']
        })
        .action((args: Vorpal.Args): Promise<void> => execute(stage, args, session));

};