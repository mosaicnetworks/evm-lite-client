"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const toml = require("toml");
const tomlify = require("tomlify-j0.4");
const mkdir = require("mkdirp");
const Globals_1 = require("../utils/Globals");
const path = require("path");
const Keystore_1 = require("./Keystore");
const DataDirectory_1 = require("./DataDirectory");
class Config {
    constructor(datadir, filename) {
        this.datadir = datadir;
        this.filename = filename;
        this.data = Config.default(this.datadir);
        this._initialData = Config.default(this.datadir);
        this.path = path.join(datadir, filename);
        if (fs.existsSync(this.path)) {
            let tomlData = Config.readFile(this.path);
            this.data = toml.parse(tomlData);
            this._initialData = toml.parse(tomlData);
        }
    }
    static readFile(path) {
        if (fs.existsSync(path)) {
            return fs.readFileSync(path, 'utf8');
        }
    }
    static default(datadir) {
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
        };
    }
    static defaultTOML(datadir) {
        return tomlify.toToml(Config.default(datadir), { spaces: 2 });
    }
    toTOML() {
        return tomlify.toToml(this.data, { spaces: 2 });
    }
    save() {
        Globals_1.default.info(`Config is being read from and updated at ${this.path}`);
        if (Globals_1.default.isEquivalentObjects(this.data, this._initialData)) {
            Globals_1.default.warning('No changes in configuration detected.');
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
            Globals_1.default.success('Configuration file updated.');
            return true;
        }
    }
    getOrCreateKeystore(password) {
        DataDirectory_1.default.createDirectoryIfNotExists(this.data.storage.keystore);
        return new Keystore_1.default(this.data.storage.keystore, password);
    }
    getOrCreatePasswordFile() {
        let password = 'supersecurepassword';
        DataDirectory_1.default.createOrReadFile(this.data.storage.password, password);
        return this.data.storage.password;
    }
}
exports.default = Config;
