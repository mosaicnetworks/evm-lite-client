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
const Globals_1 = require("../utils/Globals");
function commandAccountsGet(evmlc, session) {
    let description = 'Gets account balance and nonce from a node with a valid connection.';
    return evmlc.command('accounts get [address]').alias('a g')
        .description(description)
        .option('-f, --formatted', 'format output')
        .option('-i, --interactive', 'use interactive mode')
        .types({
        string: ['_']
    })
        .action((args) => {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            try {
                let interactive = args.options.interactive || session.interactive;
                let formatted = args.options.formatted || false;
                let connection = yield session.connect();
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
                if (!args.address && !interactive) {
                    Globals_1.default.error('Provide an address. Usage: accounts get <address>');
                    resolve();
                }
                let account = yield connection.getRemoteAccount(args.address);
                formatted ? console.table(account) : Globals_1.default.info(JSONBig.stringify(account));
            }
            catch (err) {
                (typeof err === 'object') ? console.log(err) : Globals_1.default.error(err);
            }
            resolve();
        }));
    });
}
exports.default = commandAccountsGet;
;
