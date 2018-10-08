import * as fs from 'fs';
import * as toml from "toml";
import * as tomlify from 'tomlify-j0.4'

import {isEquivalentObjects, success, warning} from "./functions";


export default class Config {

    public data: any;
    readonly _data: any;

    constructor(public configFilePath: string, defaultConfig: any = undefined) {
        let fileData: string;

        if (fs.existsSync(configFilePath)) {
            fileData = fs.readFileSync(configFilePath, 'utf8');
        } else {
            fileData = tomlify.toToml(defaultConfig, {spaces: 2});
            fs.writeFileSync(configFilePath, fileData);
        }

        this.data = toml.parse(fileData);
        this._data = toml.parse(fileData);
    }

    static create(filePath: string, data: any) {
        if (!fs.existsSync(filePath)) {
            let tomlified = tomlify.toToml(data, {spaces: 2});

            fs.writeFileSync(filePath, tomlified);
        }
    }

    toTOML(): string {
        return tomlify.toToml(this.data, {spaces: 2})
    }

    save(): void {
        if (isEquivalentObjects(this.data, this._data)) {
            warning('No changes in configuration detected.');
        } else {
            fs.writeFileSync(this.configFilePath, this.toTOML());
            success('Updated configuration file.')
        }
    }

}