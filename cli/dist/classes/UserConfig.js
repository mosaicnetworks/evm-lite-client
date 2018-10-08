"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Config_1 = require("./Config");
const path = require("path");
const fs = require("fs");
const mkdir = require("mkdirp");
const globals_1 = require("../utils/globals");
class UserConfig extends Config_1.default {
    constructor(configFilePath) {
        super(configFilePath, UserConfig.default());
        let storage = this.data.storage;
        let propNames = Object.getOwnPropertyNames(storage);
        if (!fs.existsSync(this.data.storage.keystore)) {
            mkdir.mkdirp(this.data.storage.keystore);
        }
        if (!fs.existsSync(this.data.storage.password)) {
            fs.writeFileSync(this.data.storage.password, 'supersecurepassword');
        }
    }
    static default() {
        return {
            title: 'EVM-Lite CLI Config',
            connection: {
                host: '127.0.0.1',
                port: '8080'
            },
            defaults: {
                from: '',
                gas: 0,
                gasPrice: 0
            },
            storage: {
                keystore: path.join(globals_1.evmlcDir, 'keystore'),
                password: path.join(globals_1.evmlcDir, 'pwd.txt')
            }
        };
    }
}
exports.default = UserConfig;
