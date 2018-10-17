import * as fs from "fs";
import * as path from "path";
import * as JSONBig from 'json-bigint';

import Globals from "../utils/Globals";

import {Account, Controller} from "../../../lib";


export default class Keystore {

    constructor(readonly path: string, readonly password: string) {
    }

    decrypt(connection: Controller): Promise<Account[]> {
        let accounts = [];
        let promises = [];

        fs.readdirSync(this.path).forEach((file) => {
            if (!file.startsWith('.')) {
                let keystoreFile = path.join(this.path, file);
                let v3JSONKeyStore = JSONBig.parse(fs.readFileSync(keystoreFile, 'utf8'));
                let decryptedAccount: Account = Account.decrypt(v3JSONKeyStore, this.password);

                promises.push(
                    connection.api.getAccount(decryptedAccount.address)
                        .then(({balance, nonce}) => {
                            decryptedAccount.nonce = nonce;
                            decryptedAccount.balance = balance;
                            accounts.push(decryptedAccount);
                        })
                );
            }
        });

        return Promise.all(promises)
            .then(() => {
                return new Promise<Account[]>(resolve => {
                    resolve(accounts);
                });
            })
            .catch(() => {
                return new Promise<Account[]>(resolve => {
                    resolve([])
                })
            })
    }

    create(outputPath: string, pass: string): string {
        let account: Account = Account.create();

        let output = this.path;
        let password = this.password;

        if (outputPath) {
            if (fs.existsSync(outputPath)) {
                output = outputPath;
            } else {
                Globals.warning(`Output path provided does not exists: ${outputPath}. Using default...`);
            }
        }

        if (pass) {
            if (fs.existsSync(pass)) {
                password = fs.readFileSync(pass, 'utf8');
            } else {
                Globals.warning(`Password file provided does not exists: ${pass}. Using default...`);
            }
        }

        let encryptedAccount = account.encrypt(password);
        let stringEncryptedAccount = JSONBig.stringify(encryptedAccount);
        let fileName = `UTC--${JSONBig.stringify(new Date())}--${account.address}`
            .replace(/"/g, '')
            .replace(/:/g, '-');

        fs.writeFileSync(path.join(output, fileName), stringEncryptedAccount);

        return stringEncryptedAccount;
    }

}