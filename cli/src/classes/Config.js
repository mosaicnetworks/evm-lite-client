"use strict";
exports.__esModule = true;
var fs = require("fs");
var toml = require("toml");
var tomlify = require("tomlify-j0.4");
var mkdir = require("mkdirp");
var path = require("path");
var Globals_1 = require("../utils/Globals");
var Keystore_1 = require("./Keystore");
var DataDirectory_1 = require("./DataDirectory");
var Staging_1 = require("./Staging");
var Config = /** @class */ (function () {
    function Config(datadir, filename) {
        this.datadir = datadir;
        this.filename = filename;
        this.data = Config["default"](this.datadir);
        this._initialData = Config["default"](this.datadir);
        this.path = path.join(datadir, filename);
        if (Staging_1["default"].exists(this.path)) {
            var tomlData = Config.readFile(this.path);
            this.data = toml.parse(tomlData);
            this._initialData = toml.parse(tomlData);
        }
    }
    Config.readFile = function (path) {
        if (Staging_1["default"].exists(path)) {
            return fs.readFileSync(path, 'utf8');
        }
    };
    Config["default"] = function (datadir) {
        return {
            defaults: {
                host: '127.0.0.1',
                port: '8080',
                from: '',
                gas: 100000,
                gasprice: 0,
                keystore: path.join(datadir, 'keystore')
            }
        };
    };
    Config.defaultTOML = function (datadir) {
        return tomlify.toToml(Config["default"](datadir), { spaces: 2 });
    };
    Config.prototype.toTOML = function () {
        return tomlify.toToml(this.data, { spaces: 2 });
    };
    Config.prototype.save = function () {
        if (Globals_1["default"].isEquivalentObjects(this.data, this._initialData)) {
            return false;
        }
        else {
            var list = this.path.split('/');
            list.pop();
            var configFileDir = list.join('/');
            if (!Staging_1["default"].exists(configFileDir)) {
                mkdir.mkdirp(configFileDir);
            }
            fs.writeFileSync(this.path, this.toTOML());
            this._initialData = toml.parse(this.toTOML());
            return true;
        }
    };
    Config.prototype.getOrCreateKeystore = function () {
        DataDirectory_1["default"].createDirectoryIfNotExists(this.data.defaults.keystore);
        return new Keystore_1["default"](this.data.defaults.keystore);
    };
    return Config;
}());
exports["default"] = Config;
