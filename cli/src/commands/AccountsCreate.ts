import * as Vorpal from "vorpal";
import * as fs from "fs";
import * as path from "path";
import * as JSONBig from 'json-bigint';
import * as inquirer from 'inquirer';
import * as mkdir from 'mkdirp';

import {getConfig, getInteractive, getPassword, success} from "../utils/globals";

import {Account} from '../../../lib';


/**
 * Should return a Vorpal command instance used for creating an account.
 *
 * This function should return a Vorpal command which should create accounts locally
 * and store v3JSONKeystore file in the desired keystore directory. Should also allow the option
 * to provide a password file to encrypt an account file using -p or --password flag. If no
 * password file is provided it will used the default password file specified in the config object.
 *
 * @param {Vorpal} evmlc - The command line object.
 * @returns Vorpal Command instance
 */
export default function commandAccountsCreate(evmlc: Vorpal) {

    return evmlc.command('accounts create').alias('a c')
        .description('Create an account.')
        .option('-o, --output <path>', 'provide output path')
        .option('-p, --password <path>', 'provide password file path')
        .option('-i, --interactive', 'use interactive mode')
        .option('-c, --config <path>', 'set config file path')
        .types({
            string: ['p', 'password', 'o', 'output', 'config']
        })
        .action((args: Vorpal.Args): Promise<void> => {
            let i = getInteractive(args.options.interactive);
            let config = getConfig(args.options.config);

            return new Promise<void>(resolve => {

                let createAccount = (directory: string, name: string, data: any) => {
                    if (!fs.existsSync(directory)) {
                        mkdir.sync(directory);
                    }

                    fs.writeFileSync(path.join(directory, name), data);
                };

                // handles create account logic
                let handleCreateAccount = (): void => {

                    // create an account object without saving
                    let account: Account = Account.create();

                    let outputPath: string = args.options.output || config.data.storage.keystore;
                    let password: string = getPassword(args.options.password || config.data.storage.password);

                    // encrypt account with password
                    let encryptedAccount = account.encrypt(password);

                    // path to write account file with name
                    let fileName = `UTC--date--timestamp--${account.address}`;
                    let stringEncryptedAccount = JSONBig.stringify(encryptedAccount);

                    // write encrypted account data to file
                    createAccount(outputPath, fileName, stringEncryptedAccount);

                    // output data
                    success(JSONBig.stringify(encryptedAccount));

                };

                // inquirer questions
                let questions = [
                    {
                        name: 'outputPath',
                        message: 'Enter keystore output path: ',
                        default: config.data.storage.keystore,
                        type: 'input'
                    },
                    {
                        name: 'passwordPath',
                        message: 'Enter password file path: ',
                        default: config.data.storage.password,
                        type: 'input'
                    }
                ];

                if (i) {

                    // prompt questions and wait for response
                    inquirer.prompt(questions)
                        .then((answers) => {
                            args.options.output = answers.outputPath;
                            args.options.password = answers.passwordPath;
                        })
                        .then(() => {
                            handleCreateAccount();
                            resolve();
                        });

                } else {

                    // if not interactive mode
                    handleCreateAccount();
                    resolve();

                }

            })

        });

};