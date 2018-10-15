import * as fs from "fs";

import {Controller} from "../../../lib";

import Config from "./Config";
import DataDirectory from "./DataDirectory";
import Keystore from "./Keystore";
import Transactions from "./Transactions";


export default class Session {

    public interactive: boolean;
    public passwordPath: string;

    public directory: DataDirectory;
    public connection: Controller;
    public keystore: Keystore;
    public config: Config;
    public transactions: Transactions;


    constructor(dataDirPath: string) {
        this.interactive = false;
        this.connection = null;

        this.directory = new DataDirectory(dataDirPath);
        this.transactions = new Transactions(dataDirPath);

        this.config = this.directory.createAndGetConfig();
        this.passwordPath = this.config.getOrCreatePasswordFile();
        this.keystore = this.config.getOrCreateKeystore(this.password);
    }

    get password(): string {
        return fs.readFileSync(this.passwordPath, 'utf8');
    }

    connect(): Promise<Controller> {
        return new Promise<Controller>((resolve, reject) => {
            if (!this.connection) {
                let host: string = this.config.data.connection.host || '127.0.0.1';
                let port: number = this.config.data.connection.port || 8080;
                let node = new Controller(host, port);
                node.testConnection()
                    .then((success) => {
                        if (success) {
                            this.connection = node;
                            resolve(this.connection);
                        }
                    })
                    .catch((err) => {
                        this.connection = null;
                        reject(err);
                    });
            } else {
                resolve(this.connection);
            }
        });
    };

}