"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const mkdir = require("mkdirp");
const path = require("path");
const Config_1 = require("./Config");
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
    createAndGetConfig() {
        let configFilePath = path.join(this.path, 'config.toml');
        DataDirectory.createOrReadFile(configFilePath, Config_1.default.defaultTOML(this.path));
        return new Config_1.default(this.path, 'config.toml');
    }
}
exports.default = DataDirectory;
