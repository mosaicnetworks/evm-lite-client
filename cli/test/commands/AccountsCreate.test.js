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
var Chai = require("chai");
var path = require("path");
var AccountsCreate_1 = require("../../src/commands/AccountsCreate");
var stage_1 = require("../stage");
var Staging_1 = require("../../src/classes/Staging");
var assert = Chai.assert;
describe('Command: accounts create', function () {
    it('should return non-verbose output of newly created account with password file', function () { return __awaiter(_this, void 0, void 0, function () {
        var args, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    args = {
                        options: {
                            pwd: stage_1.pwdPath
                        }
                    };
                    return [4 /*yield*/, AccountsCreate_1.stage(args, stage_1.session)];
                case 1:
                    result = _a.sent();
                    assert.equal(result.type, Staging_1["default"].SUCCESS);
                    // check output directory and password was what was expected
                    assert.equal(result.args.options.pwd, stage_1.password);
                    assert.equal(result.args.options.output, path.join(stage_1.datadir, 'keystore'));
                    assert.equal(result.args.options.verbose, undefined);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return verbose output of newly created account', function () { return __awaiter(_this, void 0, void 0, function () {
        var args, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    args = {
                        options: {
                            verbose: true,
                            pwd: stage_1.pwdPath
                        }
                    };
                    return [4 /*yield*/, AccountsCreate_1.stage(args, stage_1.session)];
                case 1:
                    result = _a.sent();
                    assert.equal(result.type, Staging_1["default"].SUCCESS);
                    // check output directory and password was what was expected
                    assert.equal(result.args.options.pwd, stage_1.password);
                    assert.equal(result.args.options.output, path.join(stage_1.datadir, 'keystore'));
                    assert.equal(result.args.options.verbose, true);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return error as password file does not exist', function () { return __awaiter(_this, void 0, void 0, function () {
        var args, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    args = {
                        options: {
                            pwd: '/directory_xyz/not_here.txt'
                        }
                    };
                    return [4 /*yield*/, AccountsCreate_1.stage(args, stage_1.session)];
                case 1:
                    result = _a.sent();
                    assert.equal(result.type, Staging_1["default"].ERROR);
                    assert.equal(result.subtype, Staging_1["default"].ERRORS.PATH_NOT_EXIST);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return error as output directory does not exists', function () { return __awaiter(_this, void 0, void 0, function () {
        var args, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    args = {
                        options: {
                            pwd: stage_1.pwdPath,
                            output: '/directory_xyz/not_here'
                        }
                    };
                    return [4 /*yield*/, AccountsCreate_1.stage(args, stage_1.session)];
                case 1:
                    result = _a.sent();
                    assert.equal(result.type, Staging_1["default"].ERROR);
                    assert.equal(result.subtype, Staging_1["default"].ERRORS.DIRECTORY_NOT_EXIST);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return error as password file is a directory', function () { return __awaiter(_this, void 0, void 0, function () {
        var args, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    args = {
                        options: {
                            pwd: stage_1.datadir
                        }
                    };
                    return [4 /*yield*/, AccountsCreate_1.stage(args, stage_1.session)];
                case 1:
                    result = _a.sent();
                    assert.equal(result.type, Staging_1["default"].ERROR);
                    assert.equal(result.subtype, Staging_1["default"].ERRORS.IS_DIRECTORY);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return error as output directory is a file', function () { return __awaiter(_this, void 0, void 0, function () {
        var args, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    args = {
                        options: {
                            pwd: stage_1.pwdPath,
                            output: stage_1.pwdPath
                        }
                    };
                    return [4 /*yield*/, AccountsCreate_1.stage(args, stage_1.session)];
                case 1:
                    result = _a.sent();
                    assert.equal(result.type, Staging_1["default"].ERROR);
                    assert.equal(result.subtype, Staging_1["default"].ERRORS.IS_FILE);
                    return [2 /*return*/];
            }
        });
    }); });
});
