"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const JSONBig = require("json-bigint");
const lib_1 = require("../../../lib");
const globals_1 = require("../utils/globals");
class Keystore {
    constructor(path, password) {
        this.path = path;
        this.password = password;
        this.accounts = [];
    }
    decrypt(connection) {
        let promises = [];
        fs.readdirSync(this.path).forEach((file) => {
            if (!file.startsWith('.')) {
                let keystoreFile = path.join(this.path, file);
                let v3JSONKeyStore = JSONBig.parse(fs.readFileSync(keystoreFile, 'utf8'));
                let decryptedAccount = lib_1.Account.decrypt(v3JSONKeyStore, this.password);
                promises.push(connection.api.getAccount(decryptedAccount.address).then((a) => {
                    let account = JSONBig.parse(a);
                    decryptedAccount.balance = account.balance;
                    if (typeof account.balance === 'object')
                        decryptedAccount.balance = account.balance.toFormat(0);
                    decryptedAccount.nonce = account.nonce;
                    this.accounts.push(decryptedAccount);
                }));
            }
        });
        return Promise.all(promises)
            .then(() => {
            return new Promise(resolve => {
                resolve(this.accounts);
            });
        })
            .catch(() => {
            return new Promise(resolve => {
                resolve([]);
            });
        });
    }
    create(outputPath = undefined, pass = undefined) {
        let account = lib_1.Account.create();
        let output = this.path;
        let password = this.password;
        if (outputPath) {
            if (fs.existsSync(outputPath)) {
                output = outputPath;
            }
            else {
                globals_1.warning(`Output path provided does not exists: ${outputPath}. Using default...`);
            }
        }
        if (pass) {
            if (fs.existsSync(pass)) {
                password = fs.readFileSync(pass, 'utf8');
            }
            else {
                globals_1.warning(`Password file provided does not exists: ${pass}. Using default...`);
            }
        }
        let encryptedAccount = account.encrypt(password);
        let stringEncryptedAccount = JSONBig.stringify(encryptedAccount);
        let fileName = `UTC--date--timestamp--${account.address}`;
        fs.writeFileSync(path.join(output, fileName), stringEncryptedAccount);
        return stringEncryptedAccount;
    }
}
exports.default = Keystore;
