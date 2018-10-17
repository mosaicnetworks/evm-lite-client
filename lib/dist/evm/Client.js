"use strict";
/**
 * @file Client.js
 * @author Mosaic Networks <https://github.com/mosaicnetworks>
 * @date 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const JSONBig = require("json-bigint");
const Chalk = require("chalk");
const error = (message) => {
    console.log(Chalk.default.red(message));
};
let request = (tx, options) => {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (response) => {
            let data = '';
            response.on('data', (chunk) => data += chunk);
            response.on('end', () => resolve(data));
            response.on('error', (err) => reject(err));
        });
        req.on('error', (err) => {
            reject(err);
        });
        if (tx)
            req.write(tx);
        req.end();
    });
};
class Client {
    constructor(host, port) {
        this.host = host;
        this.port = port;
    }
    getAccount(address) {
        return request(null, this._constructOptions('GET', `/account/${address}`))
            .then((response) => {
            let account = JSONBig.parse(response);
            if (typeof account.balance === 'object') {
                account.balance = account.balance.toFormat(0);
            }
            return account;
        })
            .catch(() => error('Could not fetch account.'));
    }
    testConnection() {
        return request(null, this._constructOptions('GET', '/info'))
            .then(() => true)
            .catch(() => error('Could connect to node.'));
    }
    getAccounts() {
        return request(null, this._constructOptions('GET', '/accounts'))
            .then((response) => {
            let json = JSONBig.parse(response);
            if (json.accounts) {
                return json.accounts.map((account) => {
                    if (typeof account.balance === 'object') {
                        account.balance = account.balance.toFormat(0);
                    }
                    return account;
                });
            }
            else {
                return [];
            }
        })
            .catch(() => error('Could not fetch accounts.'));
    }
    getInfo() {
        return request(null, this._constructOptions('GET', '/info'))
            .then((response) => JSONBig.parse(response))
            .catch(() => error('Could not fetch information.'));
    }
    call(tx) {
        return request(tx, this._constructOptions('POST', '/call'))
            .then((response) => response)
            .catch(err => error(err));
    }
    sendTx(tx) {
        return request(tx, this._constructOptions('POST', '/tx'))
            .then((response) => response)
            .catch(err => error(err));
    }
    sendRawTx(tx) {
        return request(tx, this._constructOptions('POST', '/rawtx'))
            .then((response) => response);
    }
    getReceipt(txHash) {
        return request(null, this._constructOptions('GET', `/tx/${txHash}`))
            .then((response) => JSONBig.parse(response))
            .catch(() => error(`Could not fetch receipt for hash: ${txHash}`));
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
exports.default = Client;
