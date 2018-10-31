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
const Staging_1 = require("../classes/Staging");
exports.stage = (args, session) => {
    return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
        let { error, success } = Staging_1.default.getStagingFunctions(args);
        let connection = yield session.connect(args.options.host, args.options.port);
        if (!connection) {
            resolve(error(Staging_1.default.ERRORS.INVALID_CONNECTION));
            return;
        }
        let formatted = args.options.formatted || false;
        let verbose = args.options.verbose || false;
        let table = new ASCIITable();
        let transactions = session.database.transactions.all();
        if (!transactions.length) {
            resolve(success([]));
            return;
        }
        if (!formatted) {
            resolve(success(session.database.transactions.all()));
            return;
        }
        if (verbose) {
            table.setHeading('Date Time', 'Hash', 'From', 'To', 'Value', 'Gas', 'Gas Price', 'Status');
        }
        else {
            table.setHeading('From', 'To', 'Value', 'Status');
        }
        for (let tx of transactions) {
            let txDate = new Date(tx.date);
            let receipt = yield connection.api.getReceipt(tx.txHash);
            let date = txDate.getFullYear() + '-' + (txDate.getMonth() + 1) + '-' + txDate.getDate();
            let time = txDate.getHours() + ":" + txDate.getMinutes() + ":" + txDate.getSeconds();
            if (verbose) {
                table.addRow(`${date} ${time}`, tx.txHash, tx.from, tx.to, tx.value, tx.gas, tx.gasPrice, (receipt) ? ((!receipt.status) ? 'Success' : 'Failed') : 'Failed');
            }
            else {
                table.addRow(tx.from, tx.to, tx.value, (receipt) ? ((!receipt.status) ? 'Success' : 'Failed') : 'Failed');
            }
        }
        resolve(success(table));
    }));
};
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
        .action((args) => Staging_1.execute(exports.stage, args, session));
}
exports.default = commandTransactionsList;
;
