"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var Session_1 = require("../src/classes/Session");
exports.datadir = path.join(__dirname, './assets');
exports.session = new Session_1.default(exports.datadir);
exports.pwdPath = path.join(exports.datadir, 'pwd.txt');
exports.password = fs.readFileSync(exports.pwdPath, 'utf8').trim();
exports.otherPwdPath = path.join(exports.datadir, 'other_pwd.txt');
exports.otherPassword = fs.readFileSync(exports.pwdPath, 'utf8').trim();
after(function () {
    var keystore = path.join(exports.datadir, 'keystore');
    var files = fs.readdirSync(keystore).filter(function (file) {
        return !(file.startsWith('.'));
    });
    files.forEach(function (file) {
        fs.unlinkSync(path.join(keystore, file));
    });
});
