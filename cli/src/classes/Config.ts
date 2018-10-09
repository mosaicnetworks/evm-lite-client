import * as fs from 'fs';
import * as toml from "toml";
import * as tomlify from 'tomlify-j0.4';
import * as mkdir from 'mkdirp';
import * as path from "path";

import {evmlcDir, info, isEquivalentObjects, success, warning} from "../utils/globals";


export default class Config {

    public data: any;
    private _initialData: any;

    constructor(public configFilePath: string) {
        this.data = Config.default();
        this._initialData = Config.default();

        if (fs.existsSync(configFilePath)) {
            let tomlData: string = Config.readFile(configFilePath);

            this.data = toml.parse(tomlData);
            this._initialData = toml.parse(tomlData);
        } else {

        }
    }

    static readFile(path: string): string {
        if (fs.existsSync(path)) {
            return fs.readFileSync(path, 'utf8');
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

    toTOML(): string {
        return tomlify.toToml(this.data, {spaces: 2})
    }

    save(): boolean {
        info(`Config is being read from and updated at ${this.configFilePath}`);
        if (isEquivalentObjects(this.data, this._initialData)) {
            warning('No changes in configuration detected.');
            return false;
        } else {
            let list = this.configFilePath.split('/');
            list.pop();

            let configFileDir = list.join('/');

            if (!fs.existsSync(configFileDir)) {
                mkdir.mkdirp(configFileDir);
            }

            fs.writeFileSync(this.configFilePath, this.toTOML());
            this._initialData = toml.parse(this.toTOML());

            success('Configuration file updated.');
            return true;
        }
    }

}