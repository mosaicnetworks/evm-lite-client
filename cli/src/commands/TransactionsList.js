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
function commandTransactionsList(evmlc, session) {
    let description = 'Lists all submitted transactions with the status.';
    return evmlc.command('transactions list').alias('t l')
        .description(description)
        .option('-f, --formatted', 'format output')
        .option('-v, --verbose', 'verbose output')
        .option('-h, --host <ip>', 'override config parameter host')
        .option('-p, --port <port>', 'override config parameter port')
        .types({
        string: ['h', 'host']
    })
        .action((args) => {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            let connection = yield session.connect(args.options.host, args.options.port);
            if (!connection)
                resolve();
            let formatted = args.options.formatted || false;
            let verbose = args.options.verbose || false;
            let table = new ASCIITable();
            let transactions = session.database.transactions.all();
            if (!transactions.length) {
                Globals_1.default.warning('No transactions submitted.');
                resolve();
            }
            if (!formatted) {
                Globals_1.default.success(JSONBig.stringify(session.database.transactions.all()));
            }
            else {
                if (verbose) {
                    table.setHeading('Date Time', 'Hash', 'From', 'To', 'Value', 'Gas', 'Gas Price', 'Status');
                    for (let tx of transactions) {
                        let date = new Date(tx.date);
                        let d = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
                        let t = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                        let receipt = yield connection.api.getReceipt(tx.txHash);
                        table.addRow(`${d} ${t}`, tx.txHash, tx.from, tx.to, tx.value, tx.gas, tx.gasPrice, (receipt) ? ((!receipt.failed) ? 'Success' : 'Failed') : 'Failed');
                    }
                }
                else {
                    table.setHeading('From', 'To', 'Value', 'Status');
                    for (let tx of transactions) {
                        let receipt = yield connection.api.getReceipt(tx.txHash);
                        table.addRow(tx.from, tx.to, tx.value, (receipt) ? ((!receipt.failed) ? 'Success' : 'Failed') : 'Failed');
                    }
                }
                Globals_1.default.success(table.toString());
            }
            resolve();
        }));
    });
}
exports.default = commandTransactionsList;
;
