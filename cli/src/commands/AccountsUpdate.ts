import * as Vorpal from "vorpal";
import * as inquirer from 'inquirer';
import * as fs from "fs";
import * as JSONBig from 'json-bigint';

import {Account} from "../../../lib"

import Globals from "../utils/Globals";
import Session from "../classes/Session";


export default function commandAccountsUpdate(evmlc: Vorpal, session: Session) {

    let description =
        'Update the password for a local account. Previous password must be known.';

    return evmlc.command('accounts update [address]').alias('a u')
        .description(description)
        .option('-i, --interactive', 'use interactive mode')
        .option('-o, --old <path>', 'old password file path')
        .option('-n, --new <path>', 'new password file path')
        .types({
            string: ['_', 'p', 'password']
        })
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>(async (resolve) => {
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
                    Globals.error('Provide a non-empty address. Usage: accounts update <address>');
                    resolve();
                    return;
                }

                let keystore = session.keystore.get(args.address);

                if (!keystore) {
                    Globals.error(`Cannot find keystore file of address: ${args.address}.`);
                }

                if (args.options.old) {
                    if (!fs.existsSync(args.options.old)) {
                        Globals.error('Old password file path provided does not exist.');
                        resolve();
                        return;
                    }

                    if (fs.lstatSync(args.options.old).isDirectory()) {
                        Globals.error('Old password file path provided is not a file.');
                        resolve();
                        return;
                    }

                    args.options.password = fs.readFileSync(args.options.password, 'utf8');
                } else {
                    let {password} = await inquirer.prompt(passwordQ);
                    args.options.old = password;
                }

                let decrypted: Account = null;

                try {
                    decrypted = Account.decrypt(keystore, args.options.old);
                } catch (err) {
                    Globals.error('Failed decryption of account with the password provided.');
                    resolve();
                    return;
                }

                if (!decrypted) {
                    Globals.error('Oops! Something went wrong.');
                    resolve();
                    return;
                }

                if (args.options.new) {
                    if (!fs.existsSync(args.options.new)) {
                        Globals.error('New password file path provided does not exist.');
                        resolve();
                        return;
                    }

                    if (fs.lstatSync(args.options.old).isDirectory()) {
                        Globals.error('New password file path provided is not a file.');
                        resolve();
                        return;
                    }

                    args.options.new = fs.readFileSync(args.options.password, 'utf8');
                } else {
                    let {password, verifyPassword} = await inquirer.prompt(newPasswordQ);

                    if (!(password && verifyPassword && (password === verifyPassword))) {
                        Globals.error('Error: Passwords either blank or do not match.');
                        resolve();
                        return;
                    }

                    args.options.new = password;
                }

                if (args.options.old === args.options.new) {
                    Globals.error('New password is the same as old.');
                    resolve();
                    return;
                }

                let filePath: string = session.keystore.find(args.address);
                let nKeystore = decrypted.encrypt(args.options.new);
                let sNKeystore = JSONBig.stringify(nKeystore);

                fs.writeFileSync(filePath, sNKeystore);
                Globals.success(sNKeystore);
                resolve();
            });
        });

};