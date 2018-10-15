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

    createAndGetConfig(): Config {
        let configFilePath = path.join(this.path, 'config.toml');

        DataDirectory.createOrReadFile(configFilePath, Config.defaultTOML(this.path));
        return new Config(this.path, 'config.toml');
    }


}