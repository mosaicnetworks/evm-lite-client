"use strict";
/**
 * @file AccountsGet.ts
 * @author Mosaic Networks <https://github.com/mosaicnetworks>
 * @date 2018
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ASCIITable = require("ascii-table");
const inquirer = require("inquirer");
const Staging_1 = require("../classes/Staging");
/**
 * Should return either a Staged error or success.
 *
 * @remarks
 * This staging function will parse all the arguments of the `accounts get` command
 * and resolve a success or an error.
 *
 * @param args - Arguments to the command. @link
 * @param session - Controls the session of the CLI instance.
 * @returns An object specifying a success or an error.
 *
 * @alpha
 */
exports.stage = (args, session) => {
    return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
        const { error, success } = Staging_1.default.getStagingFunctions(args);
        const connection = yield session.connect(args.options.host, args.options.port);
        if (!connection) {
            resolve(error(Staging_1.default.ERRORS.INVALID_CONNECTION));
            return;
        }
        const interactive = args.options.interactive || session.interactive;
        const formatted = args.options.formatted || false;
        const questions = [
            {
                message: 'Address: ',
                name: 'address',
                required: true,
                type: 'input'
            }
        ];
        if (interactive && !args.address) {
            const { address } = yield inquirer.prompt(questions);
            args.address = address;
        }
        if (!args.address) {
            resolve(error(Staging_1.default.ERRORS.BLANK_FIELD, 'Provide a non-empty address.'));
            return;
        }
        const account = yield connection.api.getAccount(args.address);
        if (!account) {
            resolve(error(Staging_1.default.ERRORS.FETCH_FAILED, 'Could not fetch account: ' + args.address));
            return;
        }
        const table = new ASCIITable().setHeading('Address', 'Balance', 'Nonce');
        if (formatted) {
            table.addRow(account.address, account.balance, account.nonce);
        }
        resolve(success((formatted) ? table : account));
    }));
};
/**
 * Should construct a Vorpal.Command instance for the command `accounts get`.
 *
 * @remarks
 * Allows you to get account details such as balance and nonce from the blockchain.
 *
 * Usage: `accounts get --formatted 0x583560ee73713a6554c463bd02349841cd79f6e2`
 *
 * The above command will get the account balance and nonce from the node and format
 * the returned JSON into an ASCII table.
 *
 * @param evmlc - The CLI instance.
 * @param session - Controls the session of the CLI instance.
 * @returns The Vorpal.Command instance of `accounts get`.
 *
 * @alpha
 */
function commandAccountsGet(evmlc, session) {
    const description = 'Gets account balance and nonce from a node with a valid connection.';
    return evmlc.command('accounts get [address]').alias('a g')
        .description(description)
        .option('-f, --formatted', 'format output')
        .option('-i, --interactive', 'use interactive mode')
        .option('-h, --host <ip>', 'override config parameter host')
        .option('-p, --port <port>', 'override config parameter port')
        .types({
        string: ['_', 'h', 'host']
    })
        .action((args) => Staging_1.execute(exports.stage, args, session));
}
exports.default = commandAccountsGet;
;
