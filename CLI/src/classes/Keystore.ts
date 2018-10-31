import * as fs from "fs";
import * as path from "path";
import * as JSONBig from 'json-bigint';

import {BaseAccount, v3JSONKeyStore} from "../utils/Globals";

import {Account, Controller} from "../../../Library";


export default class Keystore {

    constructor(readonly path: string) {
    }

    static create(output: string, password: string): string {
        let account: Account = Account.create();
        let eAccount = account.encrypt(password);
        let sEAccount = JSONBig.stringify(eAccount);
        let filename = `UTC--${JSONBig.stringify(new Date())}--${account.address}`
            .replace(/"/g, '')
            .replace(/:/g, '-');

        fs.writeFileSync(path.join(output, filename), sEAccount);
        return sEAccount;
    }

    files() {
        let json = [];
        let files = fs.readdirSync(this.path).filter((file) => {
            return !(file.startsWith('.'));
        });

        for (let file of files) {
            let filepath = path.join(this.path, file);
            let data = fs.readFileSync(filepath, 'utf8');

            json.push(JSONBig.parse(data));
        }

        return json
    }

    all(fetch: boolean = false, connection: Controller = null): Promise<any[]> {
        return new Promise<any[]>(async (resolve) => {
            let accounts = [];
            let files = this.files();
            if (files.length) {
                for (let file of files) {
                    let address = file.address;
                    if (fetch && connection)
                        accounts.push(await connection.api.getAccount(address));
                    else {
                        accounts.push({
                            address: address,
                            balance: 0,
                            nonce: 0
                        })
                    }
                }
                resolve(accounts);
            } else {
                resolve(accounts);
            }
        })
    }

    get(address: string): v3JSONKeyStore {
        if (address.startsWith('0x')) address = address.substr(2);
        address = address.toLowerCase();
        return this.files().filter((file) => file.address === address)[0] || null;
    }

    find(address: string) {
        let dir = fs.readdirSync(this.path).filter((file) => {
            return !(file.startsWith('.'));
        });

        if (address.startsWith('0x')) address = address.substr(2);
        address = address.toLowerCase();

        for (let filename of dir) {
            let filepath = path.join(this.path, filename);
            if (JSONBig.parse(fs.readFileSync(filepath, 'utf8')).address === address) {
                return filepath;
            }
        }
    }

    async fetch(address: string, connection: Controller): Promise<BaseAccount> {
        return new Promise<BaseAccount>(async (resolve) => {
            let account = await connection.api.getAccount(address);

            if (account) {
                resolve(account);
            }
        });
    }

}