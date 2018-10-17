import * as fs from "fs";
import DataDirectory from "./DataDirectory";

export default class Log {

    private _command: string;
    private _log: string;

    constructor(readonly path: string) {
        DataDirectory.createOrReadFile(this.path, '');

        this._log = ``;
        this._command = ``;
    }

    withCommand(command: string): this {
        let today = new Date();
        let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

        this._log += `[${date} ${time}] `;
        this._log += command;
        this._command = command;
        return this
    }

    append(keyword: string, description: string): this {
        this._append(`${keyword}: ${description}`);
        return this;
    }

    show(): void {
        console.log(this._log);
    }

    write(): this {
        let previous = fs.readFileSync(this.path, 'utf8') + '\n';
        fs.writeFileSync(this.path, previous + this._log);
        return this;
    }

    private _append(text: string): void {
        this._log += `\n${text}`
    }

}