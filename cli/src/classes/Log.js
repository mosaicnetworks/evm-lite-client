"use strict";
exports.__esModule = true;
var fs = require("fs");
var DataDirectory_1 = require("./DataDirectory");
var Log = /** @class */ (function () {
    function Log(path) {
        this.path = path;
        DataDirectory_1["default"].createOrReadFile(this.path, '');
        this._log = "";
        this._command = "";
    }
    Log.prototype.withCommand = function (command) {
        var today = new Date();
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        this._log += "[" + date + " " + time + "] ";
        this._log += command;
        this._command = command;
        return this;
    };
    Log.prototype.append = function (keyword, description) {
        this._append(keyword + ": " + description);
        return this;
    };
    Log.prototype.show = function () {
        console.log(this._log);
    };
    Log.prototype.write = function () {
        var previous = fs.readFileSync(this.path, 'utf8') + '\n';
        fs.writeFileSync(this.path, previous + this._log);
        return this;
    };
    Log.prototype._append = function (text) {
        this._log += "\n" + text;
    };
    return Log;
}());
exports["default"] = Log;
