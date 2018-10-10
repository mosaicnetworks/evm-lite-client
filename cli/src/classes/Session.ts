import {warning} from "../utils/globals";

import {Controller} from "../../../lib";

import Config from "./Config";
import DataDirectory from "./DataDirectory";
import Keystore from "./Keystore";


export default class Session {

    public interactive: boolean;
    public password: string;

    public directory: DataDirectory;
    public connection: Controller;
    public keystore: Keystore;
    public config: Config;


    constructor(dataDirPath: string) {
        this.interactive = false;
        this.connection = null;

        this.directory = new DataDirectory(dataDirPath);

        this.password = this.directory.createAndGetPasswordFile();
        this.keystore = this.directory.createAndGetKeystore(this.password);
        this.config = this.directory.createAndGetConfigFile();
    }

    connect(): Promise<Controller> {
        return new Promise<Controller>((resolve, reject) => {
            if (!this.connection) {
                let host: string = this.config.data.connection.host || '127.0.0.1';
                let port: number = this.config.data.connection.port || 8080;
                let node = new Controller(host, port);
                node.api.getAccounts().then(() => {
                    this.connection = node;
                    resolve(this.connection);
                })
                    .catch((err) => {
                        this.connection = null;
                        warning(err);
                        reject();
                    });

            } else {
                resolve(this.connection);
            }
        });
    };

}