import Config from "./Config";
import * as path from "path";
import * as fs from "fs";
import * as mkdir from 'mkdirp';

import {evmlcDir} from "./globals";


export default class UserConfig extends Config {

    constructor(configFilePath) {
        super(configFilePath, UserConfig.default());

        let storage = this.data.storage;
        let propNames = Object.getOwnPropertyNames(storage);

        if (!fs.existsSync(this.data.storage.keystore)) {
            mkdir.mkdirp(this.data.storage.keystore)
        }

        if (!fs.existsSync(this.data.storage.password)) {
            fs.writeFileSync(this.data.storage.password, 'supersecurepassword')
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
                keystore: path.join(evmlcDir, 'keystore'),
                password: path.join(evmlcDir, 'pwd.txt')
            }
        }
    }

}