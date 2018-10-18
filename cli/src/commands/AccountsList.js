"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }

        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }

        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }

        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", {value: true});
const ASCIITable = require("ascii-table");
const JSONBig = require("json-bigint");
const Globals_1 = require("../utils/Globals");

function commandAccountsList(evmlc, session) {
    let description = 'List all accounts in the local keystore directory provided by the configuration file. This command will ' +
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
        .action((args) => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                let remote = args.options.remote || false;
                let verbose = args.options.verbose || false;
                let formatted = args.options.formatted || false;
                let accounts = [];
                let accountsTable = new ASCIITable();
                let connection = null;
                if (verbose || remote) {
                    connection = yield session.connect(args.options.host, args.options.port);
                    if (!connection) {
                        resolve();
                        return;
                    }
                }
                if (remote) {
                    accounts = yield connection.api.getAccounts();
                }
                else {
                    accounts = yield session.keystore.all(verbose, connection);
                }
                if (!accounts || !accounts.length) {
                    Globals_1.default.warning('No accounts.');
                    resolve();
                    return;
                }
                if (!formatted) {
                    Globals_1.default.success(JSONBig.stringify(accounts));
                    resolve();
                    return;
                }
                if (verbose) {
                    accountsTable.setHeading('Address', 'Balance', 'Nonce');
                    for (let account of accounts) {
                        accountsTable.addRow(account.address, account.balance, account.nonce);
                    }
                }
                else {
                    accountsTable.setHeading('Addresses');
                    for (let account of accounts) {
                        accountsTable.addRow(account.address);
                    }
                }
                Globals_1.default.success((accountsTable.toString()));
                resolve();
            }));
        });
}

exports.default = commandAccountsList;
;
