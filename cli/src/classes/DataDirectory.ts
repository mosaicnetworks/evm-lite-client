import * as fs from "fs";
import * as mkdir from "mkdirp";
import * as path from 'path';

import Config from "./Config";
import Keystore from "./Keystore";


export default class DataDirectory {

    constructor(readonly path: string) {
        DataDirectory.createDirectoryIfNotExists(path);
    }

    static createDirectoryIfNotExists(path: string): void {
        if (!fs.existsSync(path)) {
            mkdir.sync(path);
        }
    }

    static createOrReadFile(path: string, data: string): string {
        if (!fs.existsSync(path)) {
            fs.writeFileSync(path, data);

            return data;
        }

        return fs.readFileSync(path, 'utf8');
    }

    createAndGetKeystore(password: string): Keystore {
        let keystorePath = path.join(this.path, 'keystore');
        DataDirectory.createDirectoryIfNotExists(keystorePath);

        return new Keystore(keystorePath, password);
    }

    createAndGetConfig(): Config {
        let configFilePath = path.join(this.path, 'config.toml');

        DataDirectory.createOrReadFile(configFilePath, Config.defaultTOML());
        return new Config(configFilePath);
    }

    createAndGetPasswordFilePath() {
        let password: string = 'supersecurepassword';
        let passwordFilePath = path.join(this.path, 'pwd.txt');
        DataDirectory.createOrReadFile(passwordFilePath, password);

        return passwordFilePath;
    }

}