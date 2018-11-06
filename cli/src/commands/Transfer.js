"use strict";
/**
 * @file AccountsCreate.ts
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
const fs = require("fs");
const inquirer = require("inquirer");
const JSONBig = require("json-bigint");
const lib_1 = require("../../../lib");
const Staging_1 = require("../classes/Staging");
/**
 * Should return either a Staged error or success.
 *
 * @remarks
 * This staging function will parse all the arguments of the `transfer` command
 * and resolve a success or an error.
 *
 * @param args - Arguments to the command.
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
        const accounts = yield session.keystore.all();
        const fromQ = [
            {
                choices: accounts.map((account) => account.address),
                message: 'From: ',
                name: 'from',
                type: 'list',
            }
        ];
        const passwordQ = [
            {
                message: 'Enter password: ',
                name: 'password',
                type: 'password',
            }
        ];
        const restOfQs = [
            {
                message: 'To',
                name: 'to',
                type: 'input',
            },
            {
                default: '100',
                message: 'Value: ',
                name: 'value',
                type: 'input',
            },
            {
                default: session.config.data.defaults.gas || 100000,
                message: 'Gas: ',
                name: 'gas',
                type: 'input',
            },
            {
                default: session.config.data.defaults.gasPrice || 0,
                message: 'Gas Price: ',
                name: 'gasPrice',
                type: 'input',
            }
        ];
        const tx = {};
        if (interactive) {
            const { from } = yield inquirer.prompt(fromQ);
            args.options.from = from;
        }
        if (!args.options.from) {
            resolve(error(Staging_1.default.ERRORS.BLANK_FIELD, '`From` address cannot be blank.'));
            return;
        }
        const keystore = session.keystore.get(args.options.from);
        if (!keystore) {
            resolve(error(Staging_1.default.ERRORS.FILE_NOT_FOUND, `Cannot find keystore file of address: ${tx.from}.`));
            return;
        }
        if (!args.options.pwd) {
            const { password } = yield inquirer.prompt(passwordQ);
            args.options.pwd = password;
        }
        else {
            if (!Staging_1.default.exists(args.options.pwd)) {
                resolve(error(Staging_1.default.ERRORS.FILE_NOT_FOUND, 'Password file path provided does not exist.'));
                return;
            }
            if (Staging_1.default.isDirectory(args.options.pwd)) {
                resolve(error(Staging_1.default.ERRORS.IS_DIRECTORY, 'Password file path provided is not a file.'));
                return;
            }
            args.options.pwd = fs.readFileSync(args.options.pwd, 'utf8').trim();
        }
        let decrypted = null;
        try {
            decrypted = lib_1.Account.decrypt(keystore, args.options.pwd);
        }
        catch (err) {
            resolve(error(Staging_1.default.ERRORS.DECRYPTION, 'Failed decryption of account.'));
            return;
        }
        if (interactive) {
            const answers = yield inquirer.prompt(restOfQs);
            args.options.to = answers.to;
            args.options.value = answers.value;
            args.options.gas = answers.gas;
            args.options.gasPrice = answers.gasPrice;
        }
        tx.from = args.options.from;
        tx.to = args.options.to || undefined;
        tx.value = args.options.value || undefined;
        tx.gas = args.options.gas || session.config.data.defaults.gas || 100000;
        tx.gasPrice = args.options.gasprice || session.config.data.defaults.gasPrice || 0;
        if ((!tx.to) || !tx.value) {
            resolve(error(Staging_1.default.ERRORS.BLANK_FIELD, 'Provide an address to send to and a value.'));
            return;
        }
        tx.chainId = 1;
        tx.nonce = (yield session.keystore.fetch(decrypted.address, connection)).nonce;
        try {
            const signed = yield decrypted.signTransaction(tx);
            const response = JSONBig.parse(yield connection.api.sendRawTx(signed.rawTransaction));
            tx.txHash = response.txHash;
            session.database.transactions.add(tx);
            yield session.database.save();
            resolve(success(`Transaction submitted: ${tx.txHash}`));
        }
        catch (e) {
            resolve(error(Staging_1.default.ERRORS.OTHER, (e.text) ? e.text : e.message));
        }
    }));
};
/**
 * Should construct a Vorpal.Command instance for the command `transfer`.
 *
 * @remarks
 * Allows you to transfer token(s) from one account to another.
 *
 * Usage: `transfer --from 0x583560ee73713a6554c463bd02349841cd79f6e2 --to 0x546756ee73713a6554c463bd02349841cd79f6e2
 * --value 200 --pwd ~/pwd.txt --gas 1000000 --gasprice 0`
 *
 * Here we have requested the transfer of `200` tokens to the specified address from
 * `0x583560ee73713a6554c463bd02349841cd79f6e2`. The default `gas` and `gasprice` can be set in the configuration file
 * to be used for all transfers.
 *
 * @param evmlc - The CLI instance.
 * @param session - Controls the session of the CLI instance.
 * @returns The Vorpal.Command instance of `accounts create`.
 *
 * @alpha
 */
function commandTransfer(evmlc, session) {
    const description = 'Initiate a transfer of token(s) to an address. Default values for gas and gas prices are set in the' +
        ' configuration file.';
    return evmlc.command('transfer').alias('t')
        .description(description)
        .option('-i, --interactive', 'value to send')
        .option('-v, --value <value>', 'value to send')
        .option('-g, --gas <value>', 'gas to send at')
        .option('-gp, --gasprice <value>', 'gas price to send at')
        .option('-t, --to <address>', 'address to send to')
        .option('-f, --from <address>', 'address to send from')
        .option('-h, --host <ip>', 'override config parameter host')
        .option('--pwd <password>', 'password file path')
        .option('-p, --port <port>', 'override config parameter port')
        .types({
        string: ['t', 'to', 'f', 'from', 'h', 'host', 'pwd'],
    })
        .action((args) => Staging_1.execute(exports.stage, args, session));
}
exports.default = commandTransfer;
;
