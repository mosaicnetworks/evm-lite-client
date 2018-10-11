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
const inquirer = require("inquirer");
const globals_1 = require("../utils/globals");
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
                let connection = yield session.connect();
                if (interactive) {
                    let questions = [
                        {
                            name: 'address',
                            type: 'input',
                            required: true,
                            message: 'Address: '
                        }
                    ];
                    let answers = yield inquirer.prompt(questions);
                    args.address = answers.address;
                }
                if (!args.address && !interactive) {
                    globals_1.error('Provide an address. Usage: accounts get <address>');
                    resolve();
                }
                let account = yield connection.getRemoteAccount(args.address);
                let counter = 0;
                let accountsTable = new ASCIITable();
                let formatted = args.options.formatted || false;
                accountsTable
                    .setHeading('#', 'Account Address', 'Balance', 'Nonce')
                    .addRow(counter, account.address, account.balance, account.nonce);
                formatted ? globals_1.info(accountsTable.toString()) : globals_1.info(JSONBig.stringify(account));
            }
            catch (err) {
                (typeof err === 'object') ? console.log(err) : globals_1.error(err);
            }
            resolve();
        }));
    });
}
exports.default = commandAccountsGet;
;
