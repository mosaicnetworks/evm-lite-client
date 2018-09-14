"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("util");
const prompt = require("prompt");
class Utils {
    constructor() {
    }
    static log(color, text) {
        console.log(color + text + '\x1b[0m');
    }
    static step(message) {
        Utils.log(Utils.fgWhite, '\n' + message);
        return new Promise((resolve) => {
            prompt.get('PRESS ENTER TO CONTINUE', function () {
                resolve();
            });
        });
    }
    static explain(message) {
        Utils.log(Utils.fgCyan, util.format('\nEXPLANATION:\n%s', message));
    }
    static space() {
        console.log('\n');
    }
    static sleep(time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }
}
Utils.fgRed = '\x1b[31m';
Utils.fgGreen = '\x1b[32m';
Utils.fgBlue = '\x1b[34m';
Utils.fgMagenta = '\x1b[35m';
Utils.fgCyan = '\x1b[36m';
Utils.fgWhite = '\x1b[37m';
exports.default = Utils;
