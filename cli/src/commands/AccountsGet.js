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
const inquirer = require("inquirer");
const ASCIITable = require("ascii-table");
const Staging_1 = require("../classes/Staging");
exports.stage = (args, session) => {
    return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
        let { error, success } = Staging_1.default.getStagingFunctions(args);
        let connection = yield session.connect(args.options.host, args.options.port);
        if (!connection) {
            resolve(error(Staging_1.default.ERRORS.INVALID_CONNECTION));
            return;
        }
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
        if (interactive && !args.address) {
            let { address } = yield inquirer.prompt(questions);
            args.address = address;
        }
        if (!args.address) {
            resolve(error(Staging_1.default.ERRORS.BLANK_FIELD, 'Provide a non-empty address.'));
            return;
        }
        let account = yield connection.api.getAccount(args.address);
        if (!account) {
            resolve(error(Staging_1.default.ERRORS.FETCH_FAILED, 'Could not fetch account: ' + args.address));
            return;
        }
        let table = new ASCIITable().setHeading('Address', 'Balance', 'Nonce');
        if (formatted) {
            table.addRow(account.address, account.balance, account.nonce);
        }
        resolve(success((formatted) ? table : account));
    }));
};
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
        .action((args) => Staging_1.execute(exports.stage, args, session));
}
exports.default = commandAccountsGet;
;
