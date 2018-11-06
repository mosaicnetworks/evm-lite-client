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
var fs = require("fs");
var inquirer = require("inquirer");
var JSONBig = require("json-bigint");
var lib_1 = require("../../../lib");
var Staging_1 = require("../classes/Staging");
/**
 * Should return either a Staged error or success.
 *
 * @remarks
 * This staging function will parse all the arguments of the `transfer` command
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
        var _a, error, success, connection, interactive, accounts, fromQ, passwordQ, restOfQs, tx, from, keystore, password, decrypted, answers, _b, signed, response, _c, _d, e_1;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _a = Staging_1["default"].getStagingFunctions(args), error = _a.error, success = _a.success;
                    return [4 /*yield*/, session.connect(args.options.host, args.options.port)];
                case 1:
                    connection = _e.sent();
                    if (!connection) {
                        resolve(error(Staging_1["default"].ERRORS.INVALID_CONNECTION));
                        return [2 /*return*/];
                    }
                    interactive = args.options.interactive || session.interactive;
                    return [4 /*yield*/, session.keystore.all()];
                case 2:
                    accounts = _e.sent();
                    fromQ = [
                        {
                            choices: accounts.map(function (account) { return account.address; }),
                            message: 'From: ',
                            name: 'from',
                            type: 'list',
                        }
                    ];
                    passwordQ = [
                        {
                            message: 'Enter password: ',
                            name: 'password',
                            type: 'password',
                        }
                    ];
                    restOfQs = [
                        {
                            message: 'To',
                            name: 'to',
                            type: 'input',
                        },
                        {
                            "default": '100',
                            message: 'Value: ',
                            name: 'value',
                            type: 'input',
                        },
                        {
                            "default": session.config.data.defaults.gas || 100000,
                            message: 'Gas: ',
                            name: 'gas',
                            type: 'input',
                        },
                        {
                            "default": session.config.data.defaults.gasPrice || 0,
                            message: 'Gas Price: ',
                            name: 'gasPrice',
                            type: 'input',
                        }
                    ];
                    tx = {};
                    if (!interactive) return [3 /*break*/, 4];
                    return [4 /*yield*/, inquirer.prompt(fromQ)];
                case 3:
                    from = (_e.sent()).from;
                    args.options.from = from;
                    _e.label = 4;
                case 4:
                    if (!args.options.from) {
                        resolve(error(Staging_1["default"].ERRORS.BLANK_FIELD, '`From` address cannot be blank.'));
                        return [2 /*return*/];
                    }
                    keystore = session.keystore.get(args.options.from);
                    if (!keystore) {
                        resolve(error(Staging_1["default"].ERRORS.FILE_NOT_FOUND, "Cannot find keystore file of address: " + tx.from + "."));
                        return [2 /*return*/];
                    }
                    if (!!args.options.pwd) return [3 /*break*/, 6];
                    return [4 /*yield*/, inquirer.prompt(passwordQ)];
                case 5:
                    password = (_e.sent()).password;
                    args.options.pwd = password;
                    return [3 /*break*/, 7];
                case 6:
                    if (!Staging_1["default"].exists(args.options.pwd)) {
                        resolve(error(Staging_1["default"].ERRORS.FILE_NOT_FOUND, 'Password file path provided does not exist.'));
                        return [2 /*return*/];
                    }
                    if (Staging_1["default"].isDirectory(args.options.pwd)) {
                        resolve(error(Staging_1["default"].ERRORS.IS_DIRECTORY, 'Password file path provided is not a file.'));
                        return [2 /*return*/];
                    }
                    args.options.pwd = fs.readFileSync(args.options.pwd, 'utf8').trim();
                    _e.label = 7;
                case 7:
                    decrypted = null;
                    try {
                        decrypted = lib_1.Account.decrypt(keystore, args.options.pwd);
                    }
                    catch (err) {
                        resolve(error(Staging_1["default"].ERRORS.DECRYPTION, 'Failed decryption of account.'));
                        return [2 /*return*/];
                    }
                    if (!interactive) return [3 /*break*/, 9];
                    return [4 /*yield*/, inquirer.prompt(restOfQs)];
                case 8:
                    answers = _e.sent();
                    args.options.to = answers.to;
                    args.options.value = answers.value;
                    args.options.gas = answers.gas;
                    args.options.gasPrice = answers.gasPrice;
                    _e.label = 9;
                case 9:
                    tx.from = args.options.from;
                    tx.to = args.options.to || undefined;
                    tx.value = args.options.value || undefined;
                    tx.gas = args.options.gas || session.config.data.defaults.gas || 100000;
                    tx.gasPrice = args.options.gasprice || session.config.data.defaults.gasPrice || 0;
                    if ((!tx.to) || !tx.value) {
                        resolve(error(Staging_1["default"].ERRORS.BLANK_FIELD, 'Provide an address to send to and a value.'));
                        return [2 /*return*/];
                    }
                    tx.chainId = 1;
                    _b = tx;
                    return [4 /*yield*/, session.keystore.fetch(decrypted.address, connection)];
                case 10:
                    _b.nonce = (_e.sent()).nonce;
                    _e.label = 11;
                case 11:
                    _e.trys.push([11, 15, , 16]);
                    return [4 /*yield*/, decrypted.signTransaction(tx)];
                case 12:
                    signed = _e.sent();
                    _d = (_c = JSONBig).parse;
                    return [4 /*yield*/, connection.api.sendRawTx(signed.rawTransaction)];
                case 13:
                    response = _d.apply(_c, [_e.sent()]);
                    tx.txHash = response.txHash;
                    session.database.transactions.add(tx);
                    return [4 /*yield*/, session.database.save()];
                case 14:
                    _e.sent();
                    resolve(success("Transaction submitted: " + tx.txHash));
                    return [3 /*break*/, 16];
                case 15:
                    e_1 = _e.sent();
                    resolve(error(Staging_1["default"].ERRORS.OTHER, (e_1.text) ? e_1.text : e_1.message));
                    return [3 /*break*/, 16];
                case 16: return [2 /*return*/];
            }
        });
    }); });
};
/**
 * Should construct a Vorpal.Command instance for the command `transfer`.
 *
 * @remarks
 * Allows you to transfer token(s) from one account to another.
 *
 * Usage: `transfer --from 0x583560ee73713a6554c463bd02349841cd79f6e2 --to 0x546756ee73713a6554c463bd02349841cd79f6e2
 * --value 200 --pwd ~/pwd.txt --gas 1000000 --gasprice 0`
 *
 * Here we have requested the transfer of `200` tokens to the specified address from
 * `0x583560ee73713a6554c463bd02349841cd79f6e2`. The default `gas` and `gasprice` can be set in the configuration file
 * to be used for all transfers.
 *
 * @param evmlc - The CLI instance.
 * @param session - Controls the session of the CLI instance.
 * @returns The Vorpal.Command instance of `accounts create`.
 *
 * @alpha
 */
function commandTransfer(evmlc, session) {
    var description = 'Initiate a transfer of token(s) to an address. Default values for gas and gas prices are set in the' +
        ' configuration file.';
    return evmlc.command('transfer').alias('t')
        .description(description)
        .option('-i, --interactive', 'value to send')
        .option('-v, --value <value>', 'value to send')
        .option('-g, --gas <value>', 'gas to send at')
        .option('-gp, --gasprice <value>', 'gas price to send at')
        .option('-t, --to <address>', 'address to send to')
        .option('-f, --from <address>', 'address to send from')
        .option('-h, --host <ip>', 'override config parameter host')
        .option('--pwd <password>', 'password file path')
        .option('-p, --port <port>', 'override config parameter port')
        .types({
        string: ['t', 'to', 'f', 'from', 'h', 'host', 'pwd'],
    })
        .action(function (args) { return Staging_1.execute(exports.stage, args, session); });
}
exports["default"] = commandTransfer;
;
