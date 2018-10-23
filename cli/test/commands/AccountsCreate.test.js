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
const Chai = require("chai");
const path = require("path");
const AccountsCreate_1 = require("../../src/commands/AccountsCreate");
const constants_1 = require("../constants");
const Staging_1 = require("../../src/classes/Staging");
const assert = Chai.assert;
describe('Command: accounts create', () => {
    it('should return non-verbose output of newly created account with password file', () => __awaiter(this, void 0, void 0, function* () {
        let args = {
            options: {
                password: constants_1.pwdPath,
            }
        };
        let result = yield AccountsCreate_1.stage(args, constants_1.session);
        assert.equal(result.type, Staging_1.default.SUCCESS);
        // check output directory and password was what was expected
        assert.equal(result.args.options.password, constants_1.password);
        assert.equal(result.args.options.output, path.join(constants_1.datadir, 'keystore'));
        assert.equal(result.args.options.verbose, undefined);
    }));
    it('should return verbose output of newly created account', () => __awaiter(this, void 0, void 0, function* () {
        let args = {
            options: {
                verbose: true,
                password: constants_1.pwdPath,
            }
        };
        let result = yield AccountsCreate_1.stage(args, constants_1.session);
        assert.equal(result.type, Staging_1.default.SUCCESS);
        // check output directory and password was what was expected
        assert.equal(result.args.options.password, constants_1.password);
        assert.equal(result.args.options.output, path.join(constants_1.datadir, 'keystore'));
        assert.equal(result.args.options.verbose, true);
    }));
    it('should return error as password file does not exist', () => __awaiter(this, void 0, void 0, function* () {
        let args = {
            options: {
                password: '/directory_xyz/not_here.txt'
            }
        };
        let result = yield AccountsCreate_1.stage(args, constants_1.session);
        assert.equal(result.type, Staging_1.default.ERROR);
        assert.equal(result.subtype, Staging_1.default.ERRORS.PATH_NOT_EXIST);
    }));
    it('should return error as output directory does not exists', () => __awaiter(this, void 0, void 0, function* () {
        let args = {
            options: {
                password: constants_1.pwdPath,
                output: '/directory_xyz/not_here'
            }
        };
        let result = yield AccountsCreate_1.stage(args, constants_1.session);
        assert.equal(result.type, Staging_1.default.ERROR);
        assert.equal(result.subtype, Staging_1.default.ERRORS.DIRECTORY_NOT_EXIST);
    }));
    it('should return error as password file is a directory', () => __awaiter(this, void 0, void 0, function* () {
        let args = {
            options: {
                password: constants_1.datadir,
            }
        };
        let result = yield AccountsCreate_1.stage(args, constants_1.session);
        assert.equal(result.type, Staging_1.default.ERROR);
        assert.equal(result.subtype, Staging_1.default.ERRORS.IS_DIRECTORY);
    }));
    it('should return error as output directory is a file', () => __awaiter(this, void 0, void 0, function* () {
        let args = {
            options: {
                password: constants_1.pwdPath,
                output: constants_1.pwdPath,
            }
        };
        let result = yield AccountsCreate_1.stage(args, constants_1.session);
        assert.equal(result.type, Staging_1.default.ERROR);
        assert.equal(result.subtype, Staging_1.default.ERRORS.IS_FILE);
    }));
});
