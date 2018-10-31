"use strict";
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
var inquirer = require("inquirer");
var fs = require("fs");
var JSONBig = require("json-bigint");
var Staging_1 = require("../classes/Staging");
var Keystore_1 = require("../classes/Keystore");
exports.stage = function (args, session) {
    return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
        var _a, error, success, interactive, verbose, questions, _b, output, password, verifyPassword, account;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = Staging_1["default"].getStagingFunctions(args), error = _a.error, success = _a.success;
                    interactive = !args.options.pwd || session.interactive;
                    verbose = args.options.verbose || false;
                    questions = [
                        {
                            name: 'output',
                            message: 'Enter keystore output path: ',
                            "default": session.keystore.path,
                            type: 'input'
                        },
                        {
                            name: 'password',
                            message: 'Enter a password: ',
                            type: 'password'
                        },
                        {
                            name: 'verifyPassword',
                            message: 'Re-enter password: ',
                            type: 'password'
                        }
                    ];
                    if (!interactive) return [3 /*break*/, 2];
                    return [4 /*yield*/, inquirer.prompt(questions)];
                case 1:
                    _b = _c.sent(), output = _b.output, password = _b.password, verifyPassword = _b.verifyPassword;
                    if (!(password && verifyPassword && (password === verifyPassword))) {
                        resolve(error(Staging_1["default"].ERRORS.BLANK_FIELD, 'Passwords either blank or do not match.'));
                        return [2 /*return*/];
                    }
                    args.options.pwd = password;
                    args.options.output = output;
                    return [3 /*break*/, 3];
                case 2:
                    if (!Staging_1["default"].exists(args.options.pwd)) {
                        resolve(error(Staging_1["default"].ERRORS.PATH_NOT_EXIST, 'Password file provided does not exist.'));
                        return [2 /*return*/];
                    }
                    if (Staging_1["default"].isDirectory(args.options.pwd)) {
                        resolve(error(Staging_1["default"].ERRORS.IS_DIRECTORY, 'Password file path provided is a directory.'));
                        return [2 /*return*/];
                    }
                    args.options.pwd = fs.readFileSync(args.options.pwd, 'utf8').trim();
                    _c.label = 3;
                case 3:
                    args.options.output = args.options.output || session.config.data.defaults.keystore;
                    if (!Staging_1["default"].exists(args.options.output)) {
                        resolve(error(Staging_1["default"].ERRORS.DIRECTORY_NOT_EXIST, 'Output directory does not exist.'));
                        return [2 /*return*/];
                    }
                    if (!Staging_1["default"].isDirectory(args.options.output)) {
                        resolve(error(Staging_1["default"].ERRORS.IS_FILE, 'Output path is not a directory.'));
                        return [2 /*return*/];
                    }
                    account = JSONBig.parse(Keystore_1["default"].create(args.options.output, args.options.pwd));
                    resolve(success(verbose ? account : "0x" + account.address));
                    return [2 /*return*/];
            }
        });
    }); });
};
function commandAccountsCreate(evmlc, session) {
    var description = 'Allows you to create and encrypt accounts locally. Created accounts will either be placed in the' +
        ' keystore folder inside the data directory provided by the global --datadir, -d flag or if no flag is' +
        ' provided, in the keystore specified in the configuration file.';
    return evmlc.command('accounts create').alias('a c')
        .description(description)
        .option('-o, --output <path>', 'keystore file output path')
        .option('-v, --verbose', 'show verbose output')
        .option('--pwd <file_path>', 'password file path')
        .types({
        string: ['pwd', 'o', 'output']
    })
        .action(function (args) { return Staging_1.execute(exports.stage, args, session); });
}
exports["default"] = commandAccountsCreate;
;
