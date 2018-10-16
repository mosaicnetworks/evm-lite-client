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
const JSONBig = require("json-bigint");
const ASCIITable = require("ascii-table");
const Globals_1 = require("../utils/Globals");
function commandInfo(evmlc, session) {
    return evmlc.command('info')
        .description('Prints information about node as JSON or --formatted.')
        .option('-f, --formatted', 'format output')
        .option('-h, --host <ip>', 'override config parameter host')
        .option('-p, --port <port>', 'override config parameter port')
        .types({
        string: ['h', 'host']
    })
        .action((args) => {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            let l = session.log().withCommand('command info');
            try {
                let formatted = args.options.formatted || false;
                let connection = yield session.connect(args.options.host, args.options.port);
                l.append('connection', 'successful');
                let response = yield connection.api.getInfo();
                l.append('request', 'successful');
                let information = JSONBig.parse(response);
                let table = new ASCIITable().setHeading('Name', 'Value');
                if (formatted) {
                    l.append('formatted', 'true');
                    for (let key in information) {
                        if (information.hasOwnProperty(key)) {
                            table.addRow(key, information[key]);
                        }
                    }
                    Globals_1.default.success(table.toString());
                }
                else {
                    l.append('formatted', 'false');
                    Globals_1.default.success(response);
                }
            }
            catch (err) {
                (typeof err === 'object') ? console.log(err) : Globals_1.default.error(err);
            }
            resolve();
        }));
    });
}
exports.default = commandInfo;
;
