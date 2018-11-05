import * as fs from "fs";
import * as JSONBig from 'json-bigint';
import * as path from "path";

import {BaseAccount, V3JSONKeyStore} from "../utils/Globals";

import {Account, Controller} from "../../../Library";


export default class Keystore {

    public static create(output: string, password: string): string {
        const account: Account = Account.create();
        const eAccount = account.encrypt(password);
        const sEAccount = JSONBig.stringify(eAccount);
        const filename = `UTC--${JSONBig.stringify(new Date())}--${account.address}`
            .replace(/"/g, '')
            .replace(/:/g, '-');

        fs.writeFileSync(path.join(output, filename), sEAccount);
        return sEAccount;
    }

    constructor(readonly path: string) {
    }

    public files() {
        const json = [];
        const files = fs.readdirSync(this.path).filter((file) => {
            return !(file.startsWith('.'));
        });

        for (const file of files) {
            const filepath = path.join(this.path, file);
            const data = fs.readFileSync(filepath, 'utf8');

            json.push(JSONBig.parse(data));
        }

        return json
    }

    public all(fetch: boolean = false, connection: Controller = null): Promise<any[]> {
        return new Promise<any[]>(async (resolve) => {
            const accounts = [];
            const files = this.files();
            if (files.length) {
                for (const file of files) {
                    const address = file.address;
                    if (fetch && connection) {
                        accounts.push(await connection.api.getAccount(address));
                    }
                    else {
                        accounts.push({
                            address,
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

    public get(address: string): V3JSONKeyStore {
        if (address.startsWith('0x')) { address = address.substr(2); }
        address = address.toLowerCase();
        return this.files().filter((file) => file.address === address)[0] || null;
    }

    public find(address: string) {
        const dir = fs.readdirSync(this.path).filter((file) => {
            return !(file.startsWith('.'));
        });

        if (address.startsWith('0x')) { address = address.substr(2); }
        address = address.toLowerCase();

        for (const filename of dir) {
            const filepath = path.join(this.path, filename);
            if (JSONBig.parse(fs.readFileSync(filepath, 'utf8')).address === address) {
                return filepath;
            }
        }
    }

    public async fetch(address: string, connection: Controller): Promise<BaseAccount> {
        return new Promise<BaseAccount>(async (resolve) => {
            const account = await connection.api.getAccount(address);

            if (account) {
                resolve(account);
            }
        });
    }

}