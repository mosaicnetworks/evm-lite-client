import Config from "./Config";
import * as path from "path";
import {evmlcDir} from "./globals";

export default class RootConfig extends Config {

    constructor(configFilePath) {
        super(configFilePath, RootConfig.default())
    }

    static default() {
        return {
            storage: {
                configDirectory: path.join(evmlcDir, 'config')
            }
        }
    }

}