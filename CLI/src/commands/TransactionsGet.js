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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
var ASCIITable = require("ascii-table");
var inquirer = require("inquirer");
var Staging_1 = require("../classes/Staging");
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
exports.stage = function (args, session) {
    return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
        var _a, error, success, connection, table, interactive, formatted, questions, hash, receipt, key, tx;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = Staging_1["default"].getStagingFunctions(args), error = _a.error, success = _a.success;
                    return [4 /*yield*/, session.connect(args.options.host, args.options.port)];
                case 1:
                    connection = _b.sent();
                    if (!connection) {
                        resolve(error(Staging_1["default"].ERRORS.INVALID_CONNECTION));
                        return [2 /*return*/];
                    }
                    table = new ASCIITable('Transaction Receipt').setHeading('Key', 'Value');
                    interactive = args.options.interactive || session.interactive;
                    formatted = args.options.formatted || false;
                    questions = [
                        {
                            message: 'Transaction Hash: ',
                            name: 'hash',
                            required: true,
                            type: 'input'
                        }
                    ];
                    if (!(interactive && !args.hash)) return [3 /*break*/, 3];
                    return [4 /*yield*/, inquirer.prompt(questions)];
                case 2:
                    hash = (_b.sent()).hash;
                    args.hash = hash;
                    _b.label = 3;
                case 3:
                    if (!args.hash) {
                        resolve(error(Staging_1["default"].ERRORS.BLANK_FIELD, 'Provide a transaction hash.'));
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, connection.api.getReceipt(args.hash)];
                case 4:
                    receipt = _b.sent();
                    if (!receipt) {
                        resolve(error(Staging_1["default"].ERRORS.FETCH_FAILED, 'Could not fetch receipt for hash: ' + args.hash));
                        return [2 /*return*/];
                    }
                    delete receipt.logsBloom;
                    delete receipt.contractAddress;
                    if (!formatted) {
                        resolve(success(receipt));
                        return [2 /*return*/];
                    }
                    for (key in receipt) {
                        if (receipt.hasOwnProperty(key)) {
                            if (key !== 'status') {
                                table.addRow(key, receipt[key]);
                            }
                            else {
                                table.addRow(key, (!receipt[key]) ? 'Successful' : 'Failed');
                            }
                        }
                    }
                    tx = session.database.transactions.get(args.hash);
                    if (!tx) {
                        resolve(error(Staging_1["default"].ERRORS.FETCH_FAILED, 'Could not find transaction in list.'));
                        return [2 /*return*/];
                    }
                    table
                        .addRow('Value', tx.value)
                        .addRow('Gas', tx.gas)
                        .addRow('Gas Price', tx.gasPrice);
                    resolve(success(table));
                    return [2 /*return*/];
            }
        });
    }); });
};
/**
 * Should construct a Vorpal.Command instance for the command `transactions get`.
 *
 * @remarks
 * Allows you to get transaction details such as `gas`, `gasprice`, `status`, `to` etc. using a
 * transaction hash.
 *
 * Usage: `transactions get --formatted 0xf4d71b947c7d870332b849b489a8f4dcdca166f9c485963b473724eab9eaee62`
 *
 * Here we have requested the details of the transaction with hash the specified hash and asked that the
 * data is formatted into an ASCII table.
 *
 * @param evmlc - The CLI instance.
 * @param session - Controls the session of the CLI instance.
 * @returns The Vorpal.Command instance of `accounts create`.
 *
 * @alpha
 */
function commandTransactionsGet(evmlc, session) {
    var description = 'Gets a transaction using its hash.';
    return evmlc.command('transactions get [hash]').alias('t g')
        .description(description)
        .option('-f, --formatted', 'format output')
        .option('-i, --interactive', 'use interactive mode')
        .option('-h, --host <ip>', 'override config parameter host')
        .option('-p, --port <port>', 'override config parameter port')
        .types({
        string: ['_', 'h', 'host']
    })
        .action(function (args) { return Staging_1.execute(exports.stage, args, session); });
}
exports["default"] = commandTransactionsGet;
;
