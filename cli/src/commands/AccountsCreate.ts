import * as Vorpal from "vorpal";
import * as fs from "fs";
import {error, success} from "../utils/functions";
import {Account} from '../../../index';
import * as ASCIITable from 'ascii-table';
import * as JSONBig from 'json-bigint';


export default function commandAccountsCreate(evmlc: Vorpal, config) {
    return evmlc.command('accounts create').alias('a c')
        .description('create an account')
        .option('-l, --local', 'create account locally')
        .option('-p, --password <password>', 'provide password to encrypt password locally')
        .types({
            string: ['p', 'password']
        })
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>(resolve => {
                let account: Account = Account.create();
                let getPassword = () => {
                    return fs.readFileSync(config.storage.password, 'utf8');
                };

                if (!args.options.local && args.options.password) {
                    // provided password but no local flag
                    error('Cannot use custom password without local flag.');
                    resolve();
                } else if (args.options.local && !args.options.password) {
                    // provided local flag but no password
                    error('Provide password to encrypt locally with -p, --password');
                    resolve();
                } else if (!args.options.local && !args.options.password) {
                    // create account remotely
                    let encryptedAccount = account.encrypt(getPassword());
                    let localPath = `${config.storage.keystore}/${account.address}`;
                    let stringEncryptedAccount = JSONBig.stringify(encryptedAccount);
                    let newAccountTable = new ASCIITable('New Account')
                        .addRow('Address', account.address)
                        .addRow('Private Key', account.privateKey);

                    fs.writeFileSync(localPath, stringEncryptedAccount);
                    success(newAccountTable.toString());
                    resolve();
                }
            });
        });
};