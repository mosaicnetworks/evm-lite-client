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
const Staging_1 = require("../classes/Staging");
exports.stage = (args, session) => {
    return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
        let { error, success } = Staging_1.default.getStagingFunctions(args);
        let connection = yield session.connect(args.options.host, args.options.port);
        if (!connection) {
            resolve(error(Staging_1.default.ERRORS.INVALID_CONNECTION));
            return;
        }
        let table = new ASCIITable('Transaction Receipt').setHeading('Key', 'Value');
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
        if (interactive && !args.hash) {
            let { hash } = yield inquirer.prompt(questions);
            args.hash = hash;
        }
        if (!args.hash) {
            resolve(error(Staging_1.default.ERRORS.BLANK_FIELD, 'Provide a transaction hash.'));
            return;
        }
        let receipt = yield connection.api.getReceipt(args.hash);
        if (!receipt) {
            resolve(error(Staging_1.default.ERRORS.FETCH_FAILED, 'Could not fetch receipt for hash: ' + args.hash));
            return;
        }
        delete receipt.logsBloom;
        delete receipt.contractAddress;
        if (!formatted) {
            resolve(success(receipt));
            return;
        }
        for (let key in receipt) {
            if (receipt.hasOwnProperty(key)) {
                if (key !== 'status') {
                    table.addRow(key, receipt[key]);
                }
                else {
                    table.addRow(key, (!receipt[key]) ? 'Successful' : 'Failed');
                }
            }
        }
        let tx = session.database.transactions.get(args.hash);
        if (!tx) {
            resolve(error(Staging_1.default.ERRORS.FETCH_FAILED, 'Could not find transaction in list.'));
            return;
        }
        table
            .addRow('Value', tx.value)
            .addRow('Gas', tx.gas)
            .addRow('Gas Price', tx.gasPrice);
        resolve(success(table));
    }));
};
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
        .action((args) => Staging_1.execute(exports.stage, args, session));
}
exports.default = commandTransactionsGet;
;
