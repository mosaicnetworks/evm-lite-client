"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const lib_1 = require("../../../lib");
const DataDirectory_1 = require("./DataDirectory");
const Database_1 = require("./Database");
const path = require("path");
class Session {
    constructor(dataDirPath) {
        this.interactive = false;
        this.connection = null;
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
        return new Promise((resolve, reject) => {
            if (!this.connection) {
                let host = forcedHost || this.config.data.connection.host || '127.0.0.1';
                let port = forcedPort || this.config.data.connection.port || 8080;
                let node = new lib_1.Controller(host, port);
                node.testConnection()
                    .then((success) => {
                    if (success) {
                        if (!forcedHost && !forcedPort) {
                            this.connection = node;
                        }
                        resolve(node);
                    }
                })
                    .catch((err) => {
                    this.connection = null;
                    reject(err);
                });
            }
            else {
                resolve(this.connection);
            }
        });
    }
    ;
}
exports.default = Session;
