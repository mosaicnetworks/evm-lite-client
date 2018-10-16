"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const DataDirectory_1 = require("./DataDirectory");
class Log {
    constructor(path) {
        this.path = path;
        DataDirectory_1.default.createOrReadFile(this.path, '');
        this._log = ``;
        this._command = ``;
    }
    withCommand(command) {
        let today = new Date();
        let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        this._log += `[${date} ${time}] `;
        this._log += command;
        this._command = command;
        return this;
    }
    append(keyword, description) {
        this._append(`${keyword}: ${description}`);
        return this;
    }
    show() {
        console.log(this._log);
    }
    write() {
        let previous = fs.readFileSync(this.path, 'utf8') + '\n';
        fs.writeFileSync(this.path, previous + this._log);
        return this;
    }
    _append(text) {
        this._log += `\n${text}`;
    }
}
exports.default = Log;
