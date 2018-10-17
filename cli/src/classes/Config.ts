import * as fs from 'fs';
import * as toml from "toml";
import * as tomlify from 'tomlify-j0.4';
import * as mkdir from 'mkdirp';

import Globals from "../utils/Globals";
import * as path from "path";
import Keystore from "./Keystore";
import DataDirectory from "./DataDirectory";

export default class Config {

    public data: any;
    public path: string;
    private _initialData: any;

    constructor(public datadir: string, public filename: string) {
        this.data = Config.default(this.datadir);
        this._initialData = Config.default(this.datadir);

        this.path = path.join(datadir, filename);

        if (fs.existsSync(this.path)) {
            let tomlData: string = Config.readFile(this.path);

            this.data = toml.parse(tomlData);
            this._initialData = toml.parse(tomlData);
        }
    }

    static readFile(path: string): string {
        if (fs.existsSync(path)) {
            return fs.readFileSync(path, 'utf8');
        }
    }

    static default(datadir: string) {
        return {
            connection: {
                host: '127.0.0.1',
                port: '8080'
            },
            defaults: {
                from: '',
                gas: 100000,
                gasPrice: 0
            },
            storage: {
                keystore: path.join(datadir, 'keystore'),
                password: path.join(datadir, 'pwd.txt'),
            }
        }
    }

    static defaultTOML(datadir: string) {
        return tomlify.toToml(Config.default(datadir), {spaces: 2});
    }

    toTOML(): string {
        return tomlify.toToml(this.data, {spaces: 2})
    }

    save(): boolean {
        Globals.info(`Config is being read from and updated at ${this.path}`);
        if (Globals.isEquivalentObjects(this.data, this._initialData)) {
            Globals.warning('No changes in configuration detected.');
            return false;
        } else {
            let list = this.path.split('/');
            list.pop();

            let configFileDir = list.join('/');

            if (!fs.existsSync(configFileDir)) {
                mkdir.mkdirp(configFileDir);
            }

            fs.writeFileSync(this.path, this.toTOML());
            this._initialData = toml.parse(this.toTOML());
            Globals.success('Configuration file updated.');

            return true;
        }
    }

    getOrCreateKeystore(password: string): Keystore {
        DataDirectory.createDirectoryIfNotExists(this.data.storage.keystore);
        return new Keystore(this.data.storage.keystore, password);
    }

    getOrCreatePasswordFile(): string {
        let password: string = 'supersecurepassword';
        DataDirectory.createOrReadFile(this.data.storage.password, password);
        return this.data.storage.password;
    }

}