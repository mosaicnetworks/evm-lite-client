import * as Vorpal from "vorpal";
import * as fs from "fs";
import * as ASCIITable from 'ascii-table';
import * as JSONBig from 'json-bigint';

import {error, success} from "../utils/functions";
import {connect} from "../evmlc";

import {Account} from '../../../index';


/**
 * Should return a Vorpal command instance of creating an account.
 *
 * This function should return a Vorpal command which should create accounts both locally
 * and store v3JSONKeystore file in the keystore directory. Should also allow the option
 * to provide a password to encrypt an account file locally using -p or --password flag
 * when used along with --local.
 *
 * @param {Vorpal} evmlc - The command line object.
 * @param {Object} config - A JSON of the TOML config file.
 * @returns Vorpal Command instance
 */
export default function commandAccountsCreate(evmlc: Vorpal, config) {

    return evmlc.command('accounts create').alias('a c')
        .option('-l, --local', 'create account locally')
        .option('-p, --password <password>', 'provide password to encrypt password locally')
        .types({
            string: ['p', 'password']
        })
        .action((args: Vorpal.Args): Promise<void> => {

            // connect to API endpoint
            return connect().then(() => {

                return new Promise<void>(resolve => {

                    // create an account object without saving
                    let account: Account = Account.create();

                    // should read password from pwd.txt file
                    let getPassword = () => {
                        return fs.readFileSync(config.storage.password, 'utf8');
                    };

                    if (!args.options.local && args.options.password) {

                        // provided password but no local flag
                        error('Cannot use custom password without --local flag.');
                        resolve();

                    } else if (args.options.local && !args.options.password) {

                        // provided local flag but no password
                        error('Provide password to encrypt locally with -p, --password');
                        resolve();

                    } else if (!args.options.local && !args.options.password) {

                        // encrypt account with password
                        let encryptedAccount = account.encrypt(getPassword());

                        // path to write account file
                        let localPath = `${config.storage.keystore}/${account.address}`;

                        let stringEncryptedAccount = JSONBig.stringify(encryptedAccount);
                        let newAccountTable = new ASCIITable('New Account')
                            .addRow('Address', account.address)
                            .addRow('Private Key', account.privateKey);

                        // write encrypt account data to file
                        fs.writeFileSync(localPath, stringEncryptedAccount);

                        success(newAccountTable.toString());
                        resolve();

                    } else if (args.options.local && args.options.password) {

                        // return encrypted account
                        success(JSONBig.stringify(account.encrypt(args.options.password)));

                    }

                });

            });

        })
        .description('Create an account.');

};