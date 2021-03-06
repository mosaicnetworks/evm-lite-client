"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const lib_1 = require("../../../lib");
const Database_1 = require("./Database");
const DataDirectory_1 = require("./DataDirectory");
const Log_1 = require("./Log");
class Session {
    constructor(dataDirPath) {
        this.interactive = false;
        this.connection = null;
        this.logs = [];
        this.logpath = path.join(dataDirPath, 'logs');
        this.directory = new DataDirectory_1.default(dataDirPath);
        this.database = new Database_1.default(path.join(dataDirPath, 'db.json'));
        this.config = this.directory.createAndGetConfig();
        this.keystore = this.config.getOrCreateKeystore();
    }
    connect(forcedHost, forcedPort) {
        const host = forcedHost || this.config.data.defaults.host || '127.0.0.1';
        const port = forcedPort || this.config.data.defaults.port || 8080;
        const node = new lib_1.Controller(host, port);
        return node.api.testConnection()
            .then((success) => {
            if (success) {
                if (this.connection && this.connection.api.host === host && this.connection.api.port === port) {
                    return this.connection;
                }
                if (!forcedHost && !forcedPort) {
                    this.connection = node;
                }
                return node;
            }
            else {
                return null;
            }
        });
    }
    ;
    log() {
        const log = new Log_1.default(this.logpath);
        this.logs.push(log);
        return log;
    }
}
exports.default = Session;
