"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const toml = require("toml");
const tomlify = require("tomlify-j0.4");
const functions_1 = require("../utils/functions");
class Config {
    constructor(configFilePath, defaultConfig = undefined) {
        this.configFilePath = configFilePath;
        let fileData;
        if (fs.existsSync(configFilePath)) {
            fileData = fs.readFileSync(configFilePath, 'utf8');
        }
        else {
            fileData = tomlify.toToml(defaultConfig, { spaces: 2 });
            fs.writeFileSync(configFilePath, fileData);
        }
        this.data = toml.parse(fileData);
        this._data = toml.parse(fileData);
    }
    static create(filePath, data) {
        if (!fs.existsSync(filePath)) {
            let tomlified = tomlify.toToml(data, { spaces: 2 });
            fs.writeFileSync(filePath, tomlified);
        }
    }
    toTOML() {
        return tomlify.toToml(this.data, { spaces: 2 });
    }
    save() {
        if (functions_1.isEquivalentObjects(this.data, this._data)) {
            functions_1.warning('No changes in configuration detected.');
        }
        else {
            fs.writeFileSync(this.configFilePath, this.toTOML());
            functions_1.success('Updated configuration file.');
        }
    }
}
exports.default = Config;
