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
const TransactionsGet_1 = require("../../src/commands/TransactionsGet");
const constants_1 = require("../constants");
const Staging_1 = require("../../src/classes/Staging");
const assert = Chai.assert;
describe('Command: transactions get', () => {
    it('should return error as socket provided is not running an active node', () => __awaiter(this, void 0, void 0, function* () {
        let args = {
            options: {
                host: '127.0.0.1',
                port: '1234',
            }
        };
        let result = yield TransactionsGet_1.stage(args, constants_1.session);
        assert.equal(result.type, Staging_1.default.ERROR);
        assert.equal(result.subtype, Staging_1.default.ERRORS.INVALID_CONNECTION);
    }));
    it('should return error no hash was provided', () => __awaiter(this, void 0, void 0, function* () {
        let args = {
            options: {
                host: '127.0.0.1',
                port: '8080',
            }
        };
        let result = yield TransactionsGet_1.stage(args, constants_1.session);
        assert.equal(result.type, Staging_1.default.ERROR);
        assert.equal(result.subtype, Staging_1.default.ERRORS.BLANK_FIELD);
    }));
});
