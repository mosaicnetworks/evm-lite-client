"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const lib_1 = require("../../../lib");
const DataDirectory_1 = require("./DataDirectory");
const Database_1 = require("./Database");
const path = require("path");
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
        this.passwordPath = this.config.getOrCreatePasswordFile();
        this.keystore = this.config.getOrCreateKeystore(this.password);
    }
    get password() {
        return fs.readFileSync(this.passwordPath, 'utf8');
    }
    connect(forcedHost, forcedPort) {
        let host = forcedHost || this.config.data.connection.host || '127.0.0.1';
        let port = forcedPort || this.config.data.connection.port || 8080;
        let node = new lib_1.Controller(host, port);
        return node.api.testConnection()
            .then((success) => {
            if (success) {
                if (this.connection) {
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
        let log = new Log_1.default(this.logpath);
        this.logs.push(log);
        return log;
    }
}
exports.default = Session;
