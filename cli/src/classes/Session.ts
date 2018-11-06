import * as path from "path";

import {Controller} from "../../../lib";

import Config from "./Config";
import Database from "./Database";
import DataDirectory from "./DataDirectory";
import Keystore from "./Keystore";
import Log from "./Log";


export default class Session {

    public interactive: boolean;
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
        this.keystore = this.config.getOrCreateKeystore();
    }

    public connect(forcedHost: string, forcedPort: number): Promise<Controller> {
        const host: string = forcedHost || this.config.data.defaults.host || '127.0.0.1';
        const port: number = forcedPort || this.config.data.defaults.port || 8080;
        const node = new Controller(host, port);

        return node.api.testConnection()
            .then((success: boolean) => {
                if (success) {
                    if (this.connection && this.connection.api.host === host && this.connection.api.port === port) {
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

    public log(): Log {
        const log = new Log(this.logpath);
        this.logs.push(log);
        return log;
    }

}