"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("../utils/globals");
const lib_1 = require("../../../lib");
const DataDirectory_1 = require("./DataDirectory");
const fs = require("fs");
class Session {
    constructor(dataDirPath) {
        this.interactive = false;
        this.connection = null;
        this.directory = new DataDirectory_1.default(dataDirPath);
        this.passwordPath = this.directory.createAndGetPasswordFilePath();
        this.keystore = this.directory.createAndGetKeystore(this.password);
        this.config = this.directory.createAndGetConfig();
    }
    get password() {
        return fs.readFileSync(this.passwordPath, 'utf8');
    }
    connect() {
        return new Promise((resolve, reject) => {
            if (!this.connection) {
                let host = this.config.data.connection.host || '127.0.0.1';
                let port = this.config.data.connection.port || 8080;
                let node = new lib_1.Controller(host, port);
                node.api.getAccounts().then(() => {
                    this.connection = node;
                    resolve(this.connection);
                })
                    .catch((err) => {
                    this.connection = null;
                    globals_1.warning(err);
                    reject();
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
