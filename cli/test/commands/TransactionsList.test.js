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
const ASCIITable = require("ascii-table");
const TransactionsList_1 = require("../../src/commands/TransactionsList");
const constants_1 = require("../constants");
const Staging_1 = require("../../src/classes/Staging");
const assert = Chai.assert;
describe('command: transactions list', () => {
    it('should return error a valid connection to a node is required', () => __awaiter(this, void 0, void 0, function* () {
        let args = {
            options: {
                verbose: true,
                host: '127.0.0.1',
                port: '1234',
            }
        };
        let result = yield TransactionsList_1.stage(args, constants_1.session);
        assert.equal(result.type, Staging_1.default.ERROR);
        assert.equal(result.subtype, Staging_1.default.ERRORS.INVALID_CONNECTION);
    }));
    it('should return list of Transactions even with a valid connection', () => __awaiter(this, void 0, void 0, function* () {
        let args = {
            options: {
                host: '127.0.0.1',
                port: '8080',
            }
        };
        let result = yield TransactionsList_1.stage(args, constants_1.session);
        assert.equal(result.type, Staging_1.default.SUCCESS);
        assert.equal(result.message instanceof Array, true);
    }));
    it('should return ASCIITable with a valid connection', () => __awaiter(this, void 0, void 0, function* () {
        let args = {
            options: {
                formatted: true,
                host: '127.0.0.1',
                port: '8080',
            }
        };
        let result = yield TransactionsList_1.stage(args, constants_1.session);
        assert.equal(result.type, Staging_1.default.SUCCESS);
        assert.equal(result.message instanceof ASCIITable || result.message instanceof Array, true);
    }));
});
