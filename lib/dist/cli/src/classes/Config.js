"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const toml = require("toml");
const tomlify = require("tomlify-j0.4");
const mkdir = require("mkdirp");
const globals_1 = require("../utils/globals");
class Config {
    constructor(path) {
        this.path = path;
        this.data = Config.default();
        this._initialData = Config.default();
        if (fs.existsSync(path)) {
            let tomlData = Config.readFile(path);
            this.data = toml.parse(tomlData);
            this._initialData = toml.parse(tomlData);
        }
        else {
        }
    }
    static readFile(path) {
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
        };
    }
    static defaultTOML() {
        return tomlify.toToml(Config.default(), { spaces: 2 });
    }
    toTOML() {
        return tomlify.toToml(this.data, { spaces: 2 });
    }
    save() {
        globals_1.info(`Config is being read from and updated at ${this.path}`);
        if (globals_1.isEquivalentObjects(this.data, this._initialData)) {
            globals_1.warning('No changes in configuration detected.');
            return false;
        }
        else {
            let list = this.path.split('/');
            list.pop();
            let configFileDir = list.join('/');
            if (!fs.existsSync(configFileDir)) {
                mkdir.mkdirp(configFileDir);
            }
            fs.writeFileSync(this.path, this.toTOML());
            this._initialData = toml.parse(this.toTOML());
            globals_1.success('Configuration file updated.');
            return true;
        }
    }
}
exports.default = Config;
