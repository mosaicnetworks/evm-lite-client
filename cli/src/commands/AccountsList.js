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
const ASCIITable = require("ascii-table");
const Globals_1 = require("../utils/Globals");
function commandAccountsList(evmlc, session) {
    let description = 'List all accounts in the local keystore directory provided by the configuration file. This command will ' +
        'also get a balance and nonce for all the accounts from the node if a valid connection is established.';
    return evmlc.command('accounts list').alias('a l')
        .description(description)
        .option('-f, --formatted', 'format output')
        .option('-r, --remote', 'list remote accounts')
        .option('-h, --host <ip>', 'override config parameter host')
        .option('-p, --port <port>', 'override config parameter port')
        .types({
        string: ['h', 'host']
    })
        .action((args) => {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            let connection = yield session.connect(args.options.host, args.options.port);
            if (!connection)
                resolve();
            let formatted = args.options.formatted || false;
            let remote = args.options.remote || false;
            let accounts = [];
            let accountsTable = new ASCIITable().setHeading('#', 'Address', 'Balance', 'Nonce');
            if (!remote) {
                accounts = (yield session.keystore.decrypt(connection)).map(account => account.toBaseAccount());
            }
            else {
                accounts = yield connection.api.getAccounts();
            }
            if (!accounts || !accounts.length) {
                Globals_1.default.warning('No accounts.');
            }
            else {
                if (formatted) {
                    let counter = 1;
                    for (let account of accounts) {
                        accountsTable.addRow(counter, account.address, account.balance, account.nonce);
                        counter++;
                    }
                }
                Globals_1.default.success((formatted) ? accountsTable.toString() : JSONBig.stringify(accounts));
            }
            resolve();
        }));
    });
}
exports.default = commandAccountsList;
;
