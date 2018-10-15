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
function TransactionsList(evmlc, session) {
    let description = 'Lists all sent transactions.';
    return evmlc.command('transactions list').alias('t l')
        .description(description)
        .option('-f, --formatted', 'format output')
        .action((args) => {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            try {
                let formatted = args.options.formatted || false;
                let counter = 0;
                let table = new ASCIITable();
                table.setHeading('Hash', 'From', 'To', 'Value', 'Gas', 'Gas Price', 'Date Time');
                if (formatted) {
                    if (session.database.transactions.all().length) {
                        session.database.transactions.all().forEach(tx => {
                            table.addRow(tx.txHash, tx.from, tx.to, tx.value, tx.gas, tx.gasPrice, tx.date);
                        });
                        Globals_1.default.success(table.toString());
                    }
                    else {
                        Globals_1.default.warning('No transactions.');
                    }
                }
                else {
                    Globals_1.default.success(JSONBig.stringify(session.database.transactions.all()));
                }
            }
            catch (err) {
                (typeof err === 'object') ? console.log(err) : console.log(err);
            }
            resolve();
        }));
    });
}
exports.default = TransactionsList;
;
