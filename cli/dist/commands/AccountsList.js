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
            let l = session.log().withCommand('accounts list');
            try {
                let connection = yield session.connect(args.options.host, args.options.port);
                let formatted = args.options.formatted || false;
                let remote = args.options.remote || false;
                let accounts = [];
                let accountsTable = new ASCIITable().setHeading('#', 'Address', 'Balance', 'Nonce');
                if (!remote) {
                    l.append('location', 'local');
                    accounts = (yield session.keystore.decrypt(connection)).map(account => account.toBaseAccount());
                    l.append('accounts', 'decryption successful');
                }
                else {
                    l.append('location', 'remote');
                    accounts = yield connection.getRemoteAccounts();
                    l.append('accounts', 'request successful');
                }
                if (formatted) {
                    l.append('formatted', 'true');
                    let counter = 1;
                    accounts.forEach(account => {
                        accountsTable.addRow(counter, account.address, account.balance, account.nonce);
                        counter++;
                    });
                }
                else {
                    l.append('formatted', 'false');
                }
                if (accounts.length) {
                    Globals_1.default.success((formatted) ? accountsTable.toString() : JSONBig.stringify(accounts));
                    l.append('status', 'success');
                }
                else {
                    Globals_1.default.warning('No accounts.');
                    l.append('status', 'no accounts');
                }
            }
            catch (err) {
                l.append('status', 'failed');
                if (typeof err === 'object') {
                    l.append(err.name, err.text);
                    console.log(err);
                }
                else {
                    l.append('error', err);
                    Globals_1.default.error(err);
                }
                (typeof err === 'object') ? console.log(err) : Globals_1.default.error(err);
            }
            l.write();
            resolve();
        }));
    });
}
exports.default = commandAccountsList;
;
