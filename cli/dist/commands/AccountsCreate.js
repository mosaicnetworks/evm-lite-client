"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const JSONBig = require("json-bigint");
const inquirer = require("inquirer");
const evmlc_1 = require("../evmlc");
const functions_1 = require("../utils/functions");
const lib_1 = require("../../../lib");
/**
 * Should return a Vorpal command instance used for creating an account.
 *
 * This function should return a Vorpal command which should create accounts locally
 * and store v3JSONKeystore file in the desired keystore directory. Should also allow the option
 * to provide a password file to encrypt an account file using -p or --password flag. If no
 * password file is provided it will used the default password file specified in the config object.
 *
 * @param {Vorpal} evmlc - The command line object.
 * @param {Object} config - A JSON of the TOML config file.
 * @returns Vorpal Command instance
 */
function commandAccountsCreate(evmlc, config) {
    return evmlc.command('accounts create').alias('a c')
        .description('Create an account.')
        .option('-o, --output <path>', 'provide output path')
        .option('-p, --password <path>', 'provide password file path')
        .option('-i, --interactive', 'use interactive mode')
        .types({
        string: ['p', 'password', 'o', 'output']
    })
        .action((args) => {
        return new Promise(resolve => {
            // handles create account logic
            let handleCreateAccount = () => {
                // create an account object without saving
                let account = lib_1.Account.create();
                let outputPath = args.options.output || config.data.storage.keystore;
                let password = functions_1.getPassword(args.options.password) || functions_1.getPassword(config.data.storage.password);
                // encrypt account with password
                let encryptedAccount = account.encrypt(password);
                // path to write account file with name
                let fileName = `UTC--date--timestamp--${account.address}`;
                let writePath = path.join(outputPath, fileName);
                let stringEncryptedAccount = JSONBig.stringify(encryptedAccount);
                // write encrypted account data to file
                fs.writeFileSync(writePath, stringEncryptedAccount);
                // output data
                functions_1.success(JSONBig.stringify(encryptedAccount));
            };
            let i = args.options.interactive || evmlc_1.interactive;
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
            }
            else {
                // if not interactive mode
                handleCreateAccount();
                resolve();
            }
        });
    });
}
exports.default = commandAccountsCreate;
;
