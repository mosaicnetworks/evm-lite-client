"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const mkdir = require("mkdirp");
const path = require("path");
const Config_1 = require("./Config");
const Keystore_1 = require("./Keystore");
class DataDirectory {
    constructor(path) {
        this.path = path;
        DataDirectory.createDirectoryIfNotExists(path);
    }
    static createDirectoryIfNotExists(path) {
        if (!fs.existsSync(path)) {
            mkdir.sync(path);
        }
    }
    static createOrReadFile(path, data) {
        if (!fs.existsSync(path)) {
            fs.writeFileSync(path, data);
            return data;
        }
        return fs.readFileSync(path, 'utf8');
    }
    createAndGetKeystore(password) {
        let keystorePath = path.join(this.path, 'keystore');
        DataDirectory.createDirectoryIfNotExists(keystorePath);
        return new Keystore_1.default(keystorePath, password);
    }
    createAndGetConfigFile() {
        let configFilePath = path.join(this.path, 'config.toml');
        DataDirectory.createOrReadFile(configFilePath, Config_1.default.defaultTOML());
        return new Config_1.default(configFilePath);
    }
    createAndGetPasswordFile() {
        let password = 'supersecurepassword';
        let passwordFilePath = path.join(this.path, 'pwd.txt');
        return DataDirectory.createOrReadFile(passwordFilePath, password);
    }
}
exports.default = DataDirectory;
