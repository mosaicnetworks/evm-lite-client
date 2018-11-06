"use strict";
/**
 * @file AccountsList.ts
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
var Staging_1 = require("../classes/Staging");
/**
 * Should return either a Staged error or success.
 *
 * @remarks
 * This staging function will parse all the arguments of the `accounts list` command
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
        var _a, error, success, remote, verbose, formatted, table, connection, accounts, _b, _i, accounts_1, account;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = Staging_1["default"].getStagingFunctions(args), error = _a.error, success = _a.success;
                    remote = args.options.remote || false;
                    verbose = args.options.verbose || false;
                    formatted = args.options.formatted || false;
                    table = new ASCIITable();
                    connection = null;
                    if (!(verbose || remote)) return [3 /*break*/, 2];
                    return [4 /*yield*/, session.connect(args.options.host, args.options.port)];
                case 1:
                    connection = _c.sent();
                    if (!connection) {
                        resolve(error(Staging_1["default"].ERRORS.INVALID_CONNECTION));
                        return [2 /*return*/];
                    }
                    _c.label = 2;
                case 2:
                    if (!remote) return [3 /*break*/, 4];
                    return [4 /*yield*/, connection.api.getAccounts()];
                case 3:
                    _b = _c.sent();
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, session.keystore.all(verbose, connection)];
                case 5:
                    _b = _c.sent();
                    _c.label = 6;
                case 6:
                    accounts = _b;
                    if (!accounts || !accounts.length) {
                        resolve(success([]));
                        return [2 /*return*/];
                    }
                    if (!formatted) {
                        resolve(success(accounts));
                        return [2 /*return*/];
                    }
                    (verbose) ? table.setHeading('Address', 'Balance', 'Nonce') : table.setHeading('Address');
                    for (_i = 0, accounts_1 = accounts; _i < accounts_1.length; _i++) {
                        account = accounts_1[_i];
                        (verbose) ? table.addRow(account.address, account.balance, account.nonce) : table.addRow(account.address);
                    }
                    resolve(success(table));
                    return [2 /*return*/];
            }
        });
    }); });
};
/**
 * Should construct a Vorpal.Command instance for the command `accounts list`.
 *
 * @remarks
 * Allows you to list all the accounts either locally or remote. If account details such
 * as balance and nonce are required then the `--verbose, -v` flag should be provided.
 * Local accounts are read from the `keystore` provided in the configuration file.
 *
 * Usage: `accounts list --verbose --formatted`
 *
 * Here we have asked to display the formatted version of all the accounts along with
 * their balance and nonce which is specified by the `verbose` flag. All accounts are
 * sourced from the local keystore.
 *
 * @param evmlc - The CLI instance.
 * @param session - Controls the session of the CLI instance.
 * @returns The Vorpal.Command instance of `accounts get`.
 *
 * @alpha
 */
function commandAccountsList(evmlc, session) {
    var description = 'List all accounts in the local keystore directory provided by the configuration file. This command will ' +
        'also get a balance and nonce for all the accounts from the node if a valid connection is established.';
    return evmlc.command('accounts list').alias('a l')
        .description(description)
        .option('-f, --formatted', 'format output')
        .option('-v, --verbose', 'verbose output (fetches balance & nonce from node)')
        .option('-r, --remote', 'list remote accounts')
        .option('-h, --host <ip>', 'override config parameter host')
        .option('-p, --port <port>', 'override config parameter port')
        .types({
        string: ['h', 'host']
    })
        .action(function (args) { return Staging_1.execute(exports.stage, args, session); });
}
exports["default"] = commandAccountsList;
;
