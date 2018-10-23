import * as Vorpal from "vorpal";
import * as inquirer from 'inquirer';
import * as fs from "fs";
import * as JSONBig from 'json-bigint';

import {Account} from "../../../lib"
import Staging, {execute, Message, StagedOutput, StagingFunction} from "../classes/Staging";

import Session from "../classes/Session";


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
            let {address} = await inquirer.prompt(addressQ);
            args.address = address;
        }

        if (!args.address) {
            resolve(error(
                Staging.ERRORS.BLANK_FIELD,
                'Provide a non-empty address. Usage: accounts update <address>'
            ));
            return;
        }

        let keystore = session.keystore.get(args.address);

        if (!keystore) {
            resolve(error(
                Staging.ERRORS.FILE_NOT_FOUND,
                `Cannot find keystore file of address: ${args.address}.`
            ));
            return;
        }

        if (args.options.old) {
            if (!fs.existsSync(args.options.old)) {
                resolve(error(
                    Staging.ERRORS.FILE_NOT_FOUND,
                    'Old password file path provided does not exist.'
                ));
                return;
            }

            if (fs.lstatSync(args.options.old).isDirectory()) {
                resolve(error(
                    Staging.ERRORS.IS_DIRECTORY,
                    'Old password file path provided is not a file.'
                ));
                return;
            }

            args.options.old = fs.readFileSync(args.options.old, 'utf8');
        } else {
            let {password} = await inquirer.prompt(passwordQ);
            args.options.old = password;
        }

        let decrypted: Account = null;

        try {
            decrypted = Account.decrypt(keystore, args.options.old);
        } catch (err) {
            resolve(error(
                Staging.ERRORS.OTHER,
                'Failed decryption of account with the password provided.'
            ));
            return;
        }

        if (!decrypted) {
            resolve(error(
                Staging.ERRORS.OTHER,
                'Oops! Something went wrong.'
            ));
            return;
        }

        if (args.options.new) {
            if (!fs.existsSync(args.options.new)) {
                resolve(error(
                    Staging.ERRORS.FILE_NOT_FOUND,
                    'New password file path provided does not exist.'
                ));
                return;
            }

            if (fs.lstatSync(args.options.new).isDirectory()) {
                resolve(error(
                    Staging.ERRORS.IS_DIRECTORY,
                    'New password file path provided is not a file.'
                ));
                return;
            }

            args.options.new = fs.readFileSync(args.options.new, 'utf8');
        } else {
            let {password, verifyPassword} = await inquirer.prompt(newPasswordQ);

            if (!(password && verifyPassword && (password === verifyPassword))) {
                resolve(error(
                    Staging.ERRORS.BLANK_FIELD,
                    'Error: Passwords either blank or do not match.'
                ));
                return;
            }

            args.options.new = password;
        }

        if (args.options.old === args.options.new) {
            resolve(error(
                Staging.ERRORS.OTHER,
                'New password is the same as old.'
            ));
            return;
        }

        let filePath: string = session.keystore.find(args.address);
        let nKeystore = decrypted.encrypt(args.options.new);
        let sNKeystore = JSONBig.stringify(nKeystore);

        fs.writeFileSync(filePath, sNKeystore);

        resolve(success(nKeystore));
    })
};

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