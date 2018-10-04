"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const JSONBig = require("json-bigint");
const inquirer = require("inquirer");
const ASCIITable = require("ascii-table");
const evmlc_1 = require("../evmlc");
const functions_1 = require("../utils/functions");
const index_1 = require("../../../index");
/**
 * Should return a Vorpal command instance used for creating an account.
 *
 * This function should return a Vorpal command which should create accounts locally
 * and store v3JSONKeystore file in the desired keystore directory. Should also allow the option
 * to provide a password file to encrypt an account file using -p or --password flag.
 *
 * @param {Vorpal} evmlc - The command line object.
 * @param {Object} config - A JSON of the TOML config file.
 * @returns Vorpal Command instance
 */
function commandAccountsCreate(evmlc, config) {
    return evmlc.command('accounts create').alias('a c')
        .description('Create an account.')
        .option('-o, --output <path>', 'provide output path')
        .option('-f, --formatted', 'output formatted text')
        .option('-p, --password <path>', 'provide password file path')
        .option('-i, --interactive', 'use interactive mode')
        .types({
            string: ['p', 'password', 'o', 'output']
    })
        .action((args) => {
        // connect to API endpoint
        return evmlc_1.connect().then(() => {
            return new Promise(resolve => {
                // should read text from a specified path
                let getPassword = (path) => {
                    if (path) {
                        return fs.readFileSync(path, 'utf8');
                    }
                    else {
                        return undefined;
                    }
                };
                // handles create account logic
                let handleCreateAccount = () => {
                    // create an account object without saving
                    let account = index_1.Account.create();
                    let outputPath = args.options.output || config.storage.keystore;
                    let password = getPassword(args.options.password) || getPassword(config.storage.password);
                    let formatted = args.options.formatted || false;
                    // encrypt account with password
                    let encryptedAccount = account.encrypt(password);
                    // path to write account file with name
                    let fileName = `--UTC--${account.address}--`;
                    let writePath = path.join(outputPath, fileName);
                    let stringEncryptedAccount = JSONBig.stringify(encryptedAccount);
                    let newAccountTable = new ASCIITable('New Account')
                        .addRow('Address', account.address)
                        .addRow('Private Key', account.privateKey);
                    // write encrypted account data to file
                    fs.writeFileSync(writePath, stringEncryptedAccount);
                    // output data either formatted or not
                    formatted ? functions_1.info(`Account created at ${outputPath} with name: ${fileName}`) : null;
                    formatted ? functions_1.success(newAccountTable.toString()) : functions_1.success(JSONBig.stringify(encryptedAccount));
                };
                let i = args.options.interactive || evmlc_1.interactive;
                let questions = [
                    {
                        name: 'outputPath',
                        message: 'Enter keystore output path: ',
                        default: config.storage.keystore,
                        type: 'input'
                    },
                    {
                        name: 'passwordPath',
                        message: 'Enter password file path: ',
                        default: config.storage.password,
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
        });
}
exports.default = commandAccountsCreate;
;
