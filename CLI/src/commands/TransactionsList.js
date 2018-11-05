"use strict";
/**
 * @file AccountsCreate.ts
 * @author Mosaic Networks <https://github.com/mosaicnetworks>
 * @date 2018
 */
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
/**
 * Should return either a Staged error or success.
 *
 * @remarks
 * This staging function will parse all the arguments of the `transactions get` command
 * and resolve a success or an error.
 *
 * @param args - Arguments to the command.
 * @param session - Controls the session of the CLI instance.
 * @returns An object specifying a success or an error.
 *
 * @alpha
 */
exports.stage = (args, session) => {
    return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
        const { error, success } = Staging_1.default.getStagingFunctions(args);
        const connection = yield session.connect(args.options.host, args.options.port);
        if (!connection) {
            resolve(error(Staging_1.default.ERRORS.INVALID_CONNECTION));
            return;
        }
        const formatted = args.options.formatted || false;
        const verbose = args.options.verbose || false;
        const table = new ASCIITable();
        const transactions = session.database.transactions.all();
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
        for (const tx of transactions) {
            const txDate = new Date(tx.date);
            const receipt = yield connection.api.getReceipt(tx.txHash);
            const date = txDate.getFullYear() + '-' + (txDate.getMonth() + 1) + '-' + txDate.getDate();
            const time = txDate.getHours() + ":" + txDate.getMinutes() + ":" + txDate.getSeconds();
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
/**
 * Should construct a Vorpal.Command instance for the command `transactions list`.
 *
 * @remarks
 * Allows you list all the transactions sent using the CLI and each of its details..
 *
 * Usage: `transactions list --formatted --verbose`
 *
 * Here we have executed a command to list all the transactions sent with the CLI and
 * asked for the `verbose` output of the data which then should be formatted into an
 * ASCII table specified by `formatted`.
 *
 * @param evmlc - The CLI instance.
 * @param session - Controls the session of the CLI instance.
 * @returns The Vorpal.Command instance of `accounts create`.
 *
 * @alpha
 */
function commandTransactionsList(evmlc, session) {
    const description = 'Lists all submitted transactions with the status.';
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
