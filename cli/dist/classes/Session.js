"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("../utils/globals");
const lib_1 = require("../../../lib");
const DataDirectory_1 = require("./DataDirectory");
class Session {
    constructor(dataDirPath) {
        this.interactive = false;
        this.connection = null;
        this.directory = new DataDirectory_1.default(dataDirPath);
        this.password = this.directory.createAndGetPasswordFile();
        this.keystore = this.directory.createAndGetKeystore(this.password);
        this.config = this.directory.createAndGetConfigFile();
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
