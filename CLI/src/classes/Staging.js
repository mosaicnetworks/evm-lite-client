"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ASCIITable = require("ascii-table");
const fs = require("fs");
const JSONBig = require("json-bigint");
const Globals_1 = require("../utils/Globals");
class Staging {
    constructor() {
    }
    static exists(path) {
        return fs.existsSync(path);
    }
    static isDirectory(path) {
        return fs.lstatSync(path).isDirectory();
    }
    static success(args, message) {
        return {
            args,
            message,
            type: Staging.SUCCESS,
        };
    }
    static error(args, subtype, message = null) {
        return {
            args,
            message,
            subtype,
            type: Staging.ERROR,
        };
    }
    static getStagingFunctions(args) {
        return {
            error: Staging.error.bind(null, args),
            success: Staging.success.bind(null, args)
        };
    }
}
Staging.ERROR = 'error';
Staging.SUCCESS = 'success';
Staging.ERRORS = {
    BLANK_FIELD: 'Field(s) should not be blank',
    DECRYPTION: 'Failed decryption',
    DIRECTORY_NOT_EXIST: 'Directory should exist',
    FETCH_FAILED: 'Could not fetch data',
    FILE_NOT_FOUND: 'Cannot find file',
    INVALID_CONNECTION: 'Invalid connection',
    IS_DIRECTORY: 'Should not be a directory',
    IS_FILE: 'Should be a directory',
    OTHER: 'Something went wrong',
    PATH_NOT_EXIST: 'Path(s) should exist',
};
exports.default = Staging;
exports.execute = (fn, args, session) => {
    return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
        const output = yield fn(args, session);
        let message;
        if (output.message) {
            switch (typeof output.message) {
                case 'string':
                    message = output.message;
                    break;
                case 'object':
                    message = (output.message instanceof ASCIITable) ? output.message.toString() : JSONBig.stringify(output.message);
                    break;
            }
        }
        else {
            message = output.subtype + '.';
        }
        Globals_1.default[output.type](`${message.charAt(0).toUpperCase() + message.slice(1)}`);
        resolve();
    }));
};
