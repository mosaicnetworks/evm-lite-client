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
const AccountsCreate = require("../../src/commands/AccountsCreate");
const AccountsUpdate_1 = require("../../src/commands/AccountsUpdate");
const constants_1 = require("../constants");
const Staging_1 = require("../../src/classes/Staging");
const assert = Chai.assert;
let account;
describe('command: accounts update', () => {
    it('should return error as no address was provided', () => __awaiter(this, void 0, void 0, function* () {
        let args = {
            options: {}
        };
        let result = yield AccountsUpdate_1.stage(args, constants_1.session);
        assert.equal(result.type, Staging_1.default.ERROR);
        assert.equal(result.subtype, Staging_1.default.ERRORS.BLANK_FIELD);
    }));
    it('should return error as address provided does not exist locally', () => __awaiter(this, void 0, void 0, function* () {
        let args = {
            address: 'does_not_exist',
            options: {}
        };
        let result = yield AccountsUpdate_1.stage(args, constants_1.session);
        assert.equal(result.type, Staging_1.default.ERROR);
        assert.equal(result.subtype, Staging_1.default.ERRORS.FILE_NOT_FOUND);
    }));
    // create account and decrypt
    it('should error as trying to decrypt with wrong password', () => __awaiter(this, void 0, void 0, function* () {
        let createArgs = {
            options: {
                verbose: true,
                password: constants_1.pwdPath
            }
        };
        // create account
        let createResult = yield AccountsCreate.stage(createArgs, constants_1.session);
        assert.equal(createResult.type, Staging_1.default.SUCCESS);
        account = createResult.message;
        let args = {
            address: account.address,
            options: {
                old: constants_1.otherPwdPath,
                new: constants_1.pwdPath
            }
        };
        // decrypt
        let result = yield AccountsUpdate_1.stage(args, constants_1.session);
        assert.equal(result.type, Staging_1.default.ERROR);
        assert.equal(result.subtype, Staging_1.default.ERRORS.OTHER);
    }));
    it('should return error as old password file does not exist', () => __awaiter(this, void 0, void 0, function* () {
        let args = {
            address: account.address,
            options: {
                old: 'does_not_exist'
            }
        };
        let result = yield AccountsUpdate_1.stage(args, constants_1.session);
        assert.equal(result.type, Staging_1.default.ERROR);
        assert.equal(result.subtype, Staging_1.default.ERRORS.FILE_NOT_FOUND);
    }));
    it('should return error as new password file does not exist', () => __awaiter(this, void 0, void 0, function* () {
        let args = {
            address: account.address,
            options: {
                old: constants_1.pwdPath,
                new: 'does_not_exist'
            }
        };
        let result = yield AccountsUpdate_1.stage(args, constants_1.session);
        assert.equal(result.type, Staging_1.default.ERROR);
        assert.equal(result.subtype, Staging_1.default.ERRORS.FILE_NOT_FOUND);
    }));
    it('should return newly encrypted account', () => __awaiter(this, void 0, void 0, function* () {
        let args = {
            address: account.address,
            options: {
                old: constants_1.pwdPath,
                new: constants_1.otherPwdPath,
            }
        };
        let result = yield AccountsUpdate_1.stage(args, constants_1.session);
        assert.equal(result.type, Staging_1.default.SUCCESS);
        assert.notEqual(result.message.address, undefined);
    }));
});
