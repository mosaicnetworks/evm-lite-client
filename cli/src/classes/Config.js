"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const toml = require("toml");
const tomlify = require("tomlify-j0.4");
const mkdir = require("mkdirp");
const path = require("path");
const Globals_1 = require("../utils/Globals");
const Keystore_1 = require("./Keystore");
const DataDirectory_1 = require("./DataDirectory");
const Staging_1 = require("./Staging");
class Config {
    constructor(datadir, filename) {
        this.datadir = datadir;
        this.filename = filename;
        this.data = Config.default(this.datadir);
        this._initialData = Config.default(this.datadir);
        this.path = path.join(datadir, filename);
        if (Staging_1.default.exists(this.path)) {
            let tomlData = Config.readFile(this.path);
            this.data = toml.parse(tomlData);
            this._initialData = toml.parse(tomlData);
        }
    }
    static readFile(path) {
        if (Staging_1.default.exists(path)) {
            return fs.readFileSync(path, 'utf8');
        }
    }
    static default(datadir) {
        return {
            defaults: {
                host: '127.0.0.1',
                port: '8080',
                from: '',
                gas: 100000,
                gasprice: 0,
                keystore: path.join(datadir, 'keystore'),
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
        if (Globals_1.default.isEquivalentObjects(this.data, this._initialData)) {
            return false;
        }
        else {
            let list = this.path.split('/');
            list.pop();
            let configFileDir = list.join('/');
            if (!Staging_1.default.exists(configFileDir)) {
                mkdir.mkdirp(configFileDir);
            }
            fs.writeFileSync(this.path, this.toTOML());
            this._initialData = toml.parse(this.toTOML());
            return true;
        }
    }
    getOrCreateKeystore() {
        DataDirectory_1.default.createDirectoryIfNotExists(this.data.defaults.keystore);
        return new Keystore_1.default(this.data.defaults.keystore);
    }
}
exports.default = Config;
