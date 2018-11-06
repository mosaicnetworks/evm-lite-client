"use strict";
exports.__esModule = true;
var fs = require("fs");
var mkdir = require("mkdirp");
var path = require("path");
var Config_1 = require("./Config");
var Staging_1 = require("./Staging");
var DataDirectory = /** @class */ (function () {
    function DataDirectory(path) {
        this.path = path;
        DataDirectory.createDirectoryIfNotExists(path);
    }
    DataDirectory.createDirectoryIfNotExists = function (path) {
        if (!Staging_1["default"].exists(path)) {
            mkdir.sync(path);
        }
    };
    DataDirectory.createOrReadFile = function (path, data) {
        if (!Staging_1["default"].exists(path)) {
            fs.writeFileSync(path, data);
            return data;
        }
        return fs.readFileSync(path, 'utf8');
    };
    DataDirectory.prototype.createAndGetConfig = function () {
        var configFilePath = path.join(this.path, 'config.toml');
        DataDirectory.createOrReadFile(configFilePath, Config_1["default"].defaultTOML(this.path));
        return new Config_1["default"](this.path, 'config.toml');
    };
    return DataDirectory;
}());
exports["default"] = DataDirectory;
