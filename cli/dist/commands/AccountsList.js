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
const JSONBig = require("json-bigint");
const Globals_1 = require("../utils/Globals");
function commandAccountsList(evmlc, session) {
    let description = 'List all accounts in the local keystore directory provided by the configuration file. This command will ' +
        'also get a balance and nonce for all the accounts from the node if a valid connection is established.';
    return evmlc.command('accounts list').alias('a l')
        .description(description)
        .option('-f, --formatted', 'format output')
        .option('-r, --remote', 'list remote accounts')
        .action((args) => {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            try {
                let connection = yield session.connect();
                let formatted = args.options.formatted || false;
                let remote = args.options.remote || false;
                let accounts = [];
                if (!remote) {
                    accounts = (yield session.keystore.decrypt(connection)).map(account => account.toBaseAccount());
                }
                else {
                    accounts = yield connection.getRemoteAccounts();
                }
                (formatted) ? console.table(accounts) : Globals_1.default.success(JSONBig.stringify(accounts));
            }
            catch (err) {
                (typeof err === 'object') ? console.log(err) : Globals_1.default.error(err);
            }
            resolve();
        }));
    });
}
exports.default = commandAccountsList;
;
