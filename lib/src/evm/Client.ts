/**
 * @file Client.js
 * @author Mosaic Networks <https://github.com/mosaicnetworks>
 * @date 2018
 */

import * as http from 'http'
import * as JSONBig from 'json-bigint'
import * as Chalk from "chalk";

import {BaseAccount, TXReceipt} from "./utils/Interfaces";


const error = (message: any): void => {
    console.log(Chalk.default.red(message));
};

let request = (tx, options): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        const req = http.request(options, (response) => {
            let data = '';
            response.on('data', (chunk) => data += chunk);
            response.on('end', () => resolve(data));
            response.on('error', (err) => reject(err));
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (tx) req.write(tx);

        req.end();
    });
};

export default class Client {
    public constructor(readonly host: string, readonly port: number) {
    }

    public getAccount(address: string): Promise<BaseAccount | void> {
        return request(null, this._constructOptions('GET', `/account/${address}`))
            .then((response: string) => {
                let account = JSONBig.parse(response);
                if (typeof account.balance === 'object') {
                    account.balance = account.balance.toFormat(0);
                }
                return account
            })
            .catch(() => error('Could not fetch account.'));
    }

    public testConnection(): Promise<boolean | void> {
        return request(null, this._constructOptions('GET', '/info'))
            .then(() => true)
            .catch(() => error('Could connect to node.'));
    }

    public getAccounts(): Promise<BaseAccount[] | void> {
        return request(null, this._constructOptions('GET', '/accounts'))
            .then((response: string) => {
                let json = JSONBig.parse(response);
                if (json.accounts) {
                    return json.accounts.map((account) => {
                        if (typeof account.balance === 'object') {
                            account.balance = account.balance.toFormat(0);
                        }
                        return account
                    });
                } else {
                    return []
                }
            })
            .catch(() => error('Could not fetch accounts.'));
    }

    public getInfo(): Promise<Object | void> {
        return request(null, this._constructOptions('GET', '/info'))
            .then((response: string) => JSONBig.parse(response))
            .catch(() => error('Could not fetch information.'));
    }

    public call(tx: string): Promise<string | void> {
        return request(tx, this._constructOptions('POST', '/call'))
            .then((response) => response)
            .catch(err => error(err));
    }

    public sendTx(tx: string): Promise<string | void> {
        return request(tx, this._constructOptions('POST', '/tx'))
            .then((response) => response)
            .catch(err => error(err));
    }

    public sendRawTx(tx: string): Promise<string | void> {
        return request(tx, this._constructOptions('POST', '/rawtx'))
            .then((response) => response)
    }

    public getReceipt(txHash: string): Promise<TXReceipt | void> {
        return request(null, this._constructOptions('GET', `/tx/${txHash}`))
            .then((response: string) => JSONBig.parse(response))
            .catch(() => error(`Could not fetch receipt for hash: ${txHash}`));
    }

    private _constructOptions(method, path: string) {
        return {
            host: this.host,
            port: this.port,
            method: method,
            path: path
        }
    }
}
