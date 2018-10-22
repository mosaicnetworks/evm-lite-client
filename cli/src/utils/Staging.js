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
const JSONBig = require("json-bigint");
const Globals_1 = require("./Globals");
exports.execute = (fn, args, session) => {
    return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
        let output = yield fn(args, session);
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
class Staging {
    constructor() {
    }
    static construct(args, type, subtype, message = null) {
        return {
            type: type,
            subtype: subtype,
            args: args,
            message: message
        };
    }
    ;
}
Staging.ERROR = 'error';
Staging.SUCCESS = 'success';
Staging.SUBTYPES = {
    errors: {
        BLANK_FIELD: 'Field(s) should not be blank',
        DIRECTORY_NOT_EXIST: 'Directory should exist',
        PATH_NOT_EXIST: 'Path(s) should exist',
        IS_FILE: 'Should be a directory',
        IS_DIRECTORY: 'Should not be a directory',
        FILE_NOT_FOUND: 'Cannot find file',
        INVALID_CONNECTION: 'Invalid connection',
        OTHER: 'Something went wrong'
    },
    success: {
        COMMAND_EXECUTION_COMPLETED: 'Command was executed successfully'
    },
};
exports.default = Staging;
