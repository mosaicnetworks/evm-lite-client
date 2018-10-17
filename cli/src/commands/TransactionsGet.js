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
const inquirer = require("inquirer");
const JSONBig = require("json-bigint");
const Globals_1 = require("../utils/Globals");
function commandTransactionsGet(evmlc, session) {
    let description = 'Gets a transaction using its hash.';
    return evmlc.command('transactions get [hash]').alias('t g')
        .description(description)
        .option('-f, --formatted', 'format output')
        .option('-i, --interactive', 'use interactive mode')
        .option('-h, --host <ip>', 'override config parameter host')
        .option('-p, --port <port>', 'override config parameter port')
        .types({
        string: ['_', 'h', 'host']
    })
        .action((args) => {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            let connection = yield session.connect(args.options.host, args.options.port);
            if (!connection)
                resolve();
            let table = new ASCIITable().setHeading('Key', 'Value');
            let interactive = args.options.interactive || session.interactive;
            let formatted = args.options.formatted || false;
            let questions = [
                {
                    name: 'hash',
                    type: 'input',
                    required: true,
                    message: 'Transaction Hash: '
                }
            ];
            if (interactive) {
                let { hash } = yield inquirer.prompt(questions);
                args.hash = hash;
            }
            if (!args.hash) {
                Globals_1.default.error('Provide a transaction hash. Usage: transactions get <hash>');
            }
            else {
                let receipt = yield connection.api.getReceipt(args.hash);
                if (!receipt)
                    resolve();
                delete receipt.logsBloom;
                delete receipt.logs;
                delete receipt.contractAddress;
                delete receipt.root;
                if (formatted) {
                    for (let key in receipt) {
                        if (receipt.hasOwnProperty(key)) {
                            table.addRow(key, receipt[key]);
                        }
                    }
                }
                Globals_1.default.success((formatted) ? table.toString() : JSONBig.stringify(receipt));
            }
            resolve();
        }));
    });
}
exports.default = commandTransactionsGet;
;
