import * as fs from "fs";

import {Controller} from "../../../lib";

import Config from "./Config";
import DataDirectory from "./DataDirectory";
import Keystore from "./Keystore";
import Database from "./Database";
import * as path from "path";
import Log from "./Log";
import Globals from "../utils/Globals";


export default class Session {

    public interactive: boolean;
    public passwordPath: string;
    public logpath: string;

    public directory: DataDirectory;
    public connection: Controller;
    public keystore: Keystore;
    public config: Config;
    public database: Database;
    public logs: Log[];


    constructor(dataDirPath: string) {
        this.interactive = false;
        this.connection = null;
        this.logs = [];
        this.logpath = path.join(dataDirPath, 'logs');

        this.directory = new DataDirectory(dataDirPath);
        this.database = new Database(path.join(dataDirPath, 'db.json'));

        this.config = this.directory.createAndGetConfig();
        this.passwordPath = this.config.getOrCreatePasswordFile();
        this.keystore = this.config.getOrCreateKeystore(this.password);
    }

    get password(): string {
        return fs.readFileSync(this.passwordPath, 'utf8');
    }

    connect(forcedHost: string, forcedPort: number): Promise<Controller> {
        let host: string = forcedHost || this.config.data.connection.host || '127.0.0.1';
        let port: number = forcedPort || this.config.data.connection.port || 8080;
        let node = new Controller(host, port);

        return node.api.testConnection()
            .then((success: boolean) => {
                if (success) {
                    if (this.connection) {
                        return this.connection
                    }

                    if (!forcedHost && !forcedPort) {
                        this.connection = node;
                    }
                    return node;
                } else {
                    return null;
                }
            })
    };

    log(): Log {
        let log = new Log(this.logpath);
        this.logs.push(log);
        return log;
    }

}