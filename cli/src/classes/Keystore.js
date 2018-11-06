"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const JSONBig = require("json-bigint");
const path = require("path");
const lib_1 = require("../../../lib");
class Keystore {
    constructor(path) {
        this.path = path;
    }
    static create(output, password) {
        const account = lib_1.Account.create();
        const eAccount = account.encrypt(password);
        const sEAccount = JSONBig.stringify(eAccount);
        const filename = `UTC--${JSONBig.stringify(new Date())}--${account.address}`
            .replace(/"/g, '')
            .replace(/:/g, '-');
        fs.writeFileSync(path.join(output, filename), sEAccount);
        return sEAccount;
    }
    files() {
        const json = [];
        const files = fs.readdirSync(this.path).filter((file) => {
            return !(file.startsWith('.'));
        });
        for (const file of files) {
            const filepath = path.join(this.path, file);
            const data = fs.readFileSync(filepath, 'utf8');
            json.push(JSONBig.parse(data));
        }
        return json;
    }
    all(fetch = false, connection = null) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            const accounts = [];
            const files = this.files();
            if (files.length) {
                for (const file of files) {
                    const address = file.address;
                    if (fetch && connection) {
                        accounts.push(yield connection.api.getAccount(address));
                    }
                    else {
                        accounts.push({
                            address,
                            balance: 0,
                            nonce: 0
                        });
                    }
                }
                resolve(accounts);
            }
            else {
                resolve(accounts);
            }
        }));
    }
    get(address) {
        if (address.startsWith('0x')) {
            address = address.substr(2);
        }
        address = address.toLowerCase();
        return this.files().filter((file) => file.address === address)[0] || null;
    }
    find(address) {
        const dir = fs.readdirSync(this.path).filter((file) => {
            return !(file.startsWith('.'));
        });
        if (address.startsWith('0x')) {
            address = address.substr(2);
        }
        address = address.toLowerCase();
        for (const filename of dir) {
            const filepath = path.join(this.path, filename);
            if (JSONBig.parse(fs.readFileSync(filepath, 'utf8')).address === address) {
                return filepath;
            }
        }
    }
    fetch(address, connection) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const account = yield connection.api.getAccount(address);
                if (account) {
                    resolve(account);
                }
            }));
        });
    }
}
exports.default = Keystore;
