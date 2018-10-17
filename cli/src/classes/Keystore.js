"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const JSONBig = require("json-bigint");
const Globals_1 = require("../utils/Globals");
const lib_1 = require("../../../lib");
class Keystore {
    constructor(path, password) {
        this.path = path;
        this.password = password;
    }
    decrypt(connection) {
        let accounts = [];
        let promises = [];
        fs.readdirSync(this.path).forEach((file) => {
            if (!file.startsWith('.')) {
                let keystoreFile = path.join(this.path, file);
                let v3JSONKeyStore = JSONBig.parse(fs.readFileSync(keystoreFile, 'utf8'));
                let decryptedAccount = lib_1.Account.decrypt(v3JSONKeyStore, this.password);
                promises.push(connection.api.getAccount(decryptedAccount.address)
                    .then(({ balance, nonce }) => {
                    decryptedAccount.nonce = nonce;
                    decryptedAccount.balance = balance;
                    accounts.push(decryptedAccount);
                }));
            }
        });
        return Promise.all(promises)
            .then(() => {
            return new Promise(resolve => {
                resolve(accounts);
            });
        })
            .catch(() => {
            return new Promise(resolve => {
                resolve([]);
            });
        });
    }
    create(outputPath, pass) {
        let account = lib_1.Account.create();
        let output = this.path;
        let password = this.password;
        if (outputPath) {
            if (fs.existsSync(outputPath)) {
                output = outputPath;
            }
            else {
                Globals_1.default.warning(`Output path provided does not exists: ${outputPath}. Using default...`);
            }
        }
        if (pass) {
            if (fs.existsSync(pass)) {
                password = fs.readFileSync(pass, 'utf8');
            }
            else {
                Globals_1.default.warning(`Password file provided does not exists: ${pass}. Using default...`);
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
exports.default = Keystore;
