"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
const http = require("http");
let request = (options, callback) => {
    return http.request(options, (response) => {
        // console.log(`${options.method} ${options.host}:${options.port}${options.path}`);
        let data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });
        response.on('end', () => {
            callback(data);
        });
    });
};

class EVMLiteClient {
    constructor(host, port) {
        this.host = host;
        this.port = port;
    }

    getAccount(address) {
        let options = this._constructOptions('GET', `/account/${address}`);
        return new Promise((resolve, reject) => {
            let req = request(options, resolve);
            req.on('error', (err) => reject(err));
            req.end();
        });
    }

    getAccounts() {
        let options = this._constructOptions('GET', '/accounts');
        return new Promise((resolve, reject) => {
            let req = request(options, resolve);
            req.on('error', (err) => reject(err));
            req.end();
        });
    }

    call(tx) {
        let options = this._constructOptions('POST', '/call');
        return new Promise((resolve, reject) => {
            let req = request(options, resolve);
            req.write(tx);
            req.on('error', (err) => reject(err));
            req.end();
        });
    }

    sendTx(tx) {
        let options = this._constructOptions('POST', '/tx');
        return new Promise((resolve, reject) => {
            let req = request(options, resolve);
            req.write(tx);
            req.on('error', (err) => reject(err));
            req.end();
        });
    }

    sendRawTx(tx) {
        let options = this._constructOptions('POST', '/rawtx');
        return new Promise((resolve, reject) => {
            let req = request(options, resolve);
            req.write(tx);
            req.on('error', (err) => reject(err));
            req.end();
        });
    }

    getReceipt(txHash) {
        let options = this._constructOptions('GET', `/tx/${txHash}`);
        return new Promise((resolve, reject) => {
            let req = request(options, resolve);
            req.on('error', (err) => reject(err));
            req.end();
        });
    }

    _constructOptions(method, path) {
        return {
            host: this.host,
            port: this.port,
            method: method,
            path: path
        };
    }
}

exports.default = EVMLiteClient;
