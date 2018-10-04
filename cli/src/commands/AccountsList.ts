import * as Vorpal from "vorpal";
import * as fs from "fs";
import * as JSONBig from 'json-bigint';
import * as path from "path";
import * as ASCIITable from 'ascii-table';

import {connect, node} from "../evmlc";
import {info, success} from "../utils/functions";

import {Account} from '../../../index';


/**
 * Should return a Vorpal command instance used for listing all account.
 *
 * This function should return a Vorpal command which should get all accounts
 * from the `/accounts` endpoint and parse them into an ASCII table.
 *
 * @param {Vorpal} evmlc - The command line object.
 * @param {Object} config - A JSON of the TOML config file.
 * @returns Vorpal Command instance
 */
export default function commandAccountsList(evmlc: Vorpal, config) {

    return evmlc.command('accounts list').alias('a l')
        .option('-f, --formatted', 'format output')
        .description('List all accounts.')
        .action((args: Vorpal.Args): Promise<void> => {

            // connect to node
            return connect().then(() => {

                return new Promise<void>(resolve => {

                    let accounts: Account[] = [];
                    let formatted: boolean = args.options.formatted || false;
                    let promises = [];
                    let getPassword = (path: string): string => {
                        if (path) {
                            return fs.readFileSync(path, 'utf8');
                        } else {
                            return undefined;
                        }
                    };

                    // get list of all files in local keystore
                    let keyStoreFiles = fs.readdirSync(config.storage.keystore);

                    // decrypt account and populate balance
                    keyStoreFiles.forEach((file) => {
                        let keystoreFile = path.join(config.storage.keystore, file);
                        let v3JSONKeyStore = JSONBig.parse(fs.readFileSync(keystoreFile, 'utf8'));
                        let decryptedAccount = Account.decrypt(v3JSONKeyStore, getPassword(config.storage.password));

                        promises.push(
                            node.api.getAccount(decryptedAccount.address).then((a) => {
                                let {address, balance, nonce} = JSONBig.parse(a);

                                decryptedAccount.balance = balance;
                                decryptedAccount.nonce = nonce;

                                accounts.push(decryptedAccount);
                            })
                        );
                    });

                    // once all promises have resolved
                    Promise.all(promises).then(() => {
                        let counter = 0;
                        let table = new ASCIITable()
                            .setHeading('#', 'Account Address', 'Balance', 'Nonce');

                        if (formatted) {

                            //formatted accounts list
                            accounts.forEach((account: Account) => {
                                counter++;
                                table.addRow(counter, account.address, account.balance, account.nonce)
                            });

                            info(table.toString());

                        } else {

                            // raw accounts list
                            success(JSONBig.stringify(accounts))

                        }

                        resolve();
                    });

                });

            });

        });

};