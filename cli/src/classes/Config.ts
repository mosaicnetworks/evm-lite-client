import * as fs from 'fs';
import * as toml from "toml";
import * as tomlify from 'tomlify-j0.4';
import * as mkdir from 'mkdirp';
import * as path from "path";

import Globals from "../utils/Globals";
import Keystore from "./Keystore";
import DataDirectory from "./DataDirectory";
import Staging from "./Staging";

export default class Config {

    public data: any;
    public path: string;
    private _initialData: any;

    constructor(public datadir: string, public filename: string) {
        this.data = Config.default(this.datadir);
        this._initialData = Config.default(this.datadir);

        this.path = path.join(datadir, filename);

        if (Staging.exists(this.path)) {
            let tomlData: string = Config.readFile(this.path);

            this.data = toml.parse(tomlData);
            this._initialData = toml.parse(tomlData);
        }
    }

    static readFile(path: string): string {
        if (Staging.exists(path)) {
            return fs.readFileSync(path, 'utf8');
        }
    }

    static default(datadir: string) {
        return {
            defaults: {
                host: '127.0.0.1',
                port: '8080',
                from: '',
                gas: 100000,
                gasprice: 0,
                keystore: path.join(datadir, 'keystore'),
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
        if (Globals.isEquivalentObjects(this.data, this._initialData)) {
            return false;
        } else {
            let list = this.path.split('/');
            list.pop();

            let configFileDir = list.join('/');

            if (!Staging.exists(configFileDir)) {
                mkdir.mkdirp(configFileDir);
            }

            fs.writeFileSync(this.path, this.toTOML());
            this._initialData = toml.parse(this.toTOML());

            return true;
        }
    }

    getOrCreateKeystore(): Keystore {
        DataDirectory.createDirectoryIfNotExists(this.data.defaults.keystore);
        return new Keystore(this.data.defaults.keystore);
    }

}