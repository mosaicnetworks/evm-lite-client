import * as fs from 'fs';
import * as toml from "toml";
import * as tomlify from 'tomlify-j0.4';
import * as mkdir from 'mkdirp';

import Globals from "../utils/Globals";


export default class Config {

    public data: any;
    private _initialData: any;

    constructor(public path: string) {
        this.data = Config.default();
        this._initialData = Config.default();

        if (fs.existsSync(path)) {
            let tomlData: string = Config.readFile(path);

            this.data = toml.parse(tomlData);
            this._initialData = toml.parse(tomlData);
        }
    }

    static readFile(path: string): string {
        if (fs.existsSync(path)) {
            return fs.readFileSync(path, 'utf8');
        }
    }

    static default() {
        return {
            connection: {
                host: '127.0.0.1',
                port: '8080'
            },
            defaults: {
                from: '',
                gas: 0,
                gasPrice: 0
            }
        }
    }

    static defaultTOML() {
        return tomlify.toToml(Config.default(), {spaces: 2});
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

}