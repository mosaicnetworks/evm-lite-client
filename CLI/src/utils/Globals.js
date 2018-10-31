"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const Chalk = require("chalk");
class Globals {
    constructor() {
    }
    static success(message) {
        console.log(Chalk.default.green(message));
    }
    static warning(message) {
        console.log(Chalk.default.yellow(message));
    }
    static error(message) {
        console.log(Chalk.default.red(message));
    }
    static info(message) {
        console.log(Chalk.default.blue(message));
    }
    static isEquivalentObjects(objectA, objectB) {
        let aProps = Object.getOwnPropertyNames(objectA);
        let bProps = Object.getOwnPropertyNames(objectB);
        if (aProps.length !== bProps.length) {
            return false;
        }
        for (let i = 0; i < aProps.length; i++) {
            let propName = aProps[i];
            if (typeof objectA[propName] === 'object' && typeof objectB[propName] === 'object') {
                if (!Globals.isEquivalentObjects(objectA[propName], objectB[propName])) {
                    return false;
                }
            }
            else if (objectA[propName] !== objectB[propName]) {
                return false;
            }
        }
        return true;
    }
}
Globals.evmlcDir = path.join(require('os').homedir(), '.evmlc');
exports.default = Globals;
