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
const inquirer = require("inquirer");
const ASCIITable = require("ascii-table");
const Globals_1 = require("../utils/Globals");
function commandAccountsGet(evmlc, session) {
    let description = 'Gets account balance and nonce from a node with a valid connection.';
    return evmlc.command('accounts get [address]').alias('a g')
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
            let interactive = args.options.interactive || session.interactive;
            let formatted = args.options.formatted || false;
            let questions = [
                {
                    name: 'address',
                    type: 'input',
                    required: true,
                    message: 'Address: '
                }
            ];
            if (interactive) {
                let { address } = yield inquirer.prompt(questions);
                args.address = address;
            }
            if (!args.address) {
                Globals_1.default.error('Provide an address. Usage: accounts get <address>');
                resolve();
            }
            let account = yield connection.api.getAccount(args.address);
            if (account) {
                if (formatted) {
                    let table = new ASCIITable().setHeading('Address', 'Balance', 'Nonce');
                    table.addRow(account.address, account.balance, account.nonce);
                    Globals_1.default.success(table.toString());
                }
                else {
                    Globals_1.default.success(JSONBig.stringify(account));
                }
            }
            resolve();
        }));
    });
}
exports.default = commandAccountsGet;
;
