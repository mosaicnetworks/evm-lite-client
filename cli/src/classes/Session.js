"use strict";
exports.__esModule = true;
var path = require("path");
var lib_1 = require("../../../lib");
var DataDirectory_1 = require("./DataDirectory");
var Database_1 = require("./Database");
var Log_1 = require("./Log");
var Session = /** @class */ (function () {
    function Session(dataDirPath) {
        this.interactive = false;
        this.connection = null;
        this.logs = [];
        this.logpath = path.join(dataDirPath, 'logs');
        this.directory = new DataDirectory_1["default"](dataDirPath);
        this.database = new Database_1["default"](path.join(dataDirPath, 'db.json'));
        this.config = this.directory.createAndGetConfig();
        this.keystore = this.config.getOrCreateKeystore();
    }
    Session.prototype.connect = function (forcedHost, forcedPort) {
        var _this = this;
        var host = forcedHost || this.config.data.defaults.host || '127.0.0.1';
        var port = forcedPort || this.config.data.defaults.port || 8080;
        var node = new lib_1.Controller(host, port);
        return node.api.testConnection()
            .then(function (success) {
            if (success) {
                if (_this.connection) {
                    return _this.connection;
                }
                if (!forcedHost && !forcedPort) {
                    _this.connection = node;
                }
                return node;
            }
            else {
                return null;
            }
        });
    };
    ;
    Session.prototype.log = function () {
        var log = new Log_1["default"](this.logpath);
        this.logs.push(log);
        return log;
    };
    return Session;
}());
exports["default"] = Session;
