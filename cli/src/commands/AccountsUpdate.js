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
 * This staging function will parse all the arguments of the `accounts update` command
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
        var _a, error, success, interactive, accounts, addressQ, passwordQ, newPasswordQ, address, keystore, password, decrypted, _b, password, verifyPassword, newKeystore;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = Staging_1["default"].getStagingFunctions(args), error = _a.error, success = _a.success;
                    interactive = args.options.interactive || session.interactive;
                    return [4 /*yield*/, session.keystore.all()];
                case 1:
                    accounts = _c.sent();
                    addressQ = [
                        {
                            choices: accounts.map(function (account) { return account.address; }),
                            message: 'Address: ',
                            name: 'address',
                            type: 'list'
                        }
                    ];
                    passwordQ = [
                        {
                            message: 'Enter current password: ',
                            name: 'password',
                            type: 'password'
                        }
                    ];
                    newPasswordQ = [
                        {
                            message: 'Enter a new password: ',
                            name: 'password',
                            type: 'password',
                        },
                        {
                            message: 'Re-enter new password: ',
                            name: 'verifyPassword',
                            type: 'password',
                        }
                    ];
                    if (!(interactive && !args.address)) return [3 /*break*/, 3];
                    return [4 /*yield*/, inquirer.prompt(addressQ)];
                case 2:
                    address = (_c.sent()).address;
                    args.address = address;
                    _c.label = 3;
                case 3:
                    if (!args.address) {
                        resolve(error(Staging_1["default"].ERRORS.BLANK_FIELD, 'Provide a non-empty address.'));
                        return [2 /*return*/];
                    }
                    keystore = session.keystore.get(args.address);
                    if (!keystore) {
                        resolve(error(Staging_1["default"].ERRORS.FILE_NOT_FOUND, "Cannot find keystore file of address."));
                        return [2 /*return*/];
                    }
                    if (!!args.options.old) return [3 /*break*/, 5];
                    return [4 /*yield*/, inquirer.prompt(passwordQ)];
                case 4:
                    password = (_c.sent()).password;
                    args.options.old = password.trim();
                    return [3 /*break*/, 6];
                case 5:
                    if (!Staging_1["default"].exists(args.options.old)) {
                        resolve(error(Staging_1["default"].ERRORS.FILE_NOT_FOUND, 'Old password file path provided does not exist.'));
                        return [2 /*return*/];
                    }
                    if (Staging_1["default"].isDirectory(args.options.old)) {
                        resolve(error(Staging_1["default"].ERRORS.IS_DIRECTORY, 'Old password file path provided is not a file.'));
                        return [2 /*return*/];
                    }
                    args.options.old = fs.readFileSync(args.options.old, 'utf8').trim();
                    _c.label = 6;
                case 6:
                    decrypted = null;
                    try {
                        decrypted = lib_1.Account.decrypt(keystore, args.options.old);
                    }
                    catch (err) {
                        resolve(error(Staging_1["default"].ERRORS.DECRYPTION, 'Failed decryption of account with the password provided.'));
                        return [2 /*return*/];
                    }
                    if (!!args.options["new"]) return [3 /*break*/, 8];
                    return [4 /*yield*/, inquirer.prompt(newPasswordQ)];
                case 7:
                    _b = _c.sent(), password = _b.password, verifyPassword = _b.verifyPassword;
                    if (!(password && verifyPassword && (password === verifyPassword))) {
                        resolve(error(Staging_1["default"].ERRORS.BLANK_FIELD, 'Passwords either blank or do not match.'));
                        return [2 /*return*/];
                    }
                    args.options["new"] = password.trim();
                    return [3 /*break*/, 9];
                case 8:
                    if (!Staging_1["default"].exists(args.options["new"])) {
                        resolve(error(Staging_1["default"].ERRORS.FILE_NOT_FOUND, 'New password file path provided does not exist.'));
                        return [2 /*return*/];
                    }
                    if (Staging_1["default"].isDirectory(args.options["new"])) {
                        resolve(error(Staging_1["default"].ERRORS.IS_DIRECTORY, 'New password file path provided is not a file.'));
                        return [2 /*return*/];
                    }
                    args.options["new"] = fs.readFileSync(args.options["new"], 'utf8').trim();
                    _c.label = 9;
                case 9:
                    if (args.options.old === args.options["new"]) {
                        resolve(error(Staging_1["default"].ERRORS.OTHER, 'New password is the same as old.'));
                        return [2 /*return*/];
                    }
                    newKeystore = decrypted.encrypt(args.options["new"]);
                    fs.writeFileSync(session.keystore.find(args.address), JSONBig.stringify(newKeystore));
                    resolve(success(newKeystore));
                    return [2 /*return*/];
            }
        });
    }); });
};
/**
 * Should construct a Vorpal.Command instance for the command `accounts update`.
 *
 * @remarks
 * Allows you to update the password of a `V3JSONKeystore` file if the the previous password
 * is known.
 *
 * Usage: `accounts update 0x583560ee73713a6554c463bd02349841cd79f6e2 --old ~/oldpwd.txt --new ~/newpwd.txt`
 *
 * Here we have written a command to change the password from the contents `oldpwd.txt` to the contents
 * of `newpwd.txt` for the account `0x583560ee73713a6554c463bd02349841cd79f6e2`.
 *
 * @param evmlc - The CLI instance.
 * @param session - Controls the session of the CLI instance.
 * @returns The Vorpal.Command instance of `accounts get`.
 *
 * @alpha
 */
function commandAccountsUpdate(evmlc, session) {
    var description = 'Update the password for a local account. Previous password must be known.';
    return evmlc.command('accounts update [address]').alias('a u')
        .description(description)
        .option('-i, --interactive', 'use interactive mode')
        .option('-o, --old <path>', 'old password file path')
        .option('-n, --new <path>', 'new password file path')
        .types({
        string: ['_', 'old', 'o', 'n', 'new']
    })
        .action(function (args) { return Staging_1.execute(exports.stage, args, session); });
}
exports["default"] = commandAccountsUpdate;
;
