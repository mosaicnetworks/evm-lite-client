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
const inquirer = require("inquirer");
const fs = require("fs");
const JSONBig = require("json-bigint");
const lib_1 = require("../../../lib");
const Globals_1 = require("../utils/Globals");
function commandTransfer(evmlc, session) {
    let description = 'Initiate a transfer of token(s) to an address. Default values for gas and gas prices are set in the' +
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
        .option('--password <password>', 'password file path')
        .option('-p, --port <port>', 'override config parameter port')
        .types({
        string: ['t', 'to', 'f', 'from', 'h', 'host'],
    })
        .action((args) => {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            let connection = yield session.connect(args.options.host, args.options.port);
            if (!connection) {
                resolve();
                return;
            }
            let interactive = args.options.interactive || session.interactive;
            let accounts = yield session.keystore.all();
            let fromQ = [
                {
                    name: 'from',
                    type: 'list',
                    message: 'From: ',
                    choices: accounts.map((account) => account.address)
                }
            ];
            let passwordQ = [
                {
                    name: 'password',
                    type: 'password',
                    message: 'Enter password: ',
                }
            ];
            let restOfQs = [
                {
                    name: 'to',
                    type: 'input',
                    message: 'To'
                },
                {
                    name: 'value',
                    type: 'input',
                    default: '100',
                    message: 'Value: '
                },
                {
                    name: 'gas',
                    type: 'input',
                    default: session.config.data.defaults.gas || 100000,
                    message: 'Gas: '
                },
                {
                    name: 'gasPrice',
                    type: 'input',
                    default: session.config.data.defaults.gasPrice || 0,
                    message: 'Gas Price: '
                }
            ];
            let tx = {};
            if (interactive) {
                let { from } = yield inquirer.prompt(fromQ);
                tx.from = from;
            }
            else {
                tx.from = args.options.from || undefined;
            }
            if (!tx.from) {
                Globals_1.default.error('`From` address cannot be blank.');
                resolve();
                return;
            }
            let keystore = session.keystore.get(tx.from);
            if (!keystore) {
                Globals_1.default.error(`Cannot find keystore file of address: ${tx.from}.`);
            }
            if (args.options.password) {
                if (!fs.existsSync(args.options.password)) {
                    Globals_1.default.error('Password file path provided does not exist.');
                    resolve();
                    return;
                }
                if (fs.lstatSync(args.options.password).isDirectory()) {
                    Globals_1.default.error('Password file path provided is not a file.');
                    resolve();
                    return;
                }
                args.options.password = fs.readFileSync(args.options.password, 'utf8');
            }
            else {
                let { password } = yield inquirer.prompt(passwordQ);
                args.options.password = password;
            }
            let decrypted = null;
            try {
                decrypted = lib_1.Account.decrypt(keystore, args.options.password);
            }
            catch (err) {
                Globals_1.default.error('Failed decryption of account with the password provided.');
                resolve();
                return;
            }
            if (!decrypted) {
                Globals_1.default.error('Oops! Something went wrong.');
                resolve();
                return;
            }
            if (interactive) {
                let answers = yield inquirer.prompt(restOfQs);
                args.options.to = answers.to;
                args.options.value = answers.value;
                args.options.gas = answers.gas;
                args.options.gasPrice = answers.gasPrice;
            }
            tx.to = args.options.to || undefined;
            tx.value = args.options.value || undefined;
            tx.gas = args.options.gas || session.config.data.defaults.gas || 100000;
            tx.gasPrice = args.options.gasprice || session.config.data.defaults.gasPrice || 0;
            if ((!tx.to) || !tx.value) {
                Globals_1.default.error('Provide an address to send to and a value.');
                resolve();
                return;
            }
            tx.chainId = 1;
            tx.nonce = (yield session.keystore.fetch(decrypted.address, connection)).nonce;
            console.log(tx);
            try {
                let signed = yield decrypted.signTransaction(tx);
                connection.api.sendRawTx(signed.rawTransaction)
                    .then((resp) => {
                    let response = JSONBig.parse(resp);
                    tx.txHash = response.txHash;
                    session.database.transactions.add(tx);
                    session.database.save();
                    Globals_1.default.info(`(From) ${tx.from} -> (To) ${tx.to} (${tx.value})`);
                    Globals_1.default.success(`Transaction submitted.`);
                    resolve();
                })
                    .catch(() => {
                    Globals_1.default.error('Ran out of gas. Current Gas: ' + parseInt(tx.gas, 16));
                    resolve();
                });
            }
            catch (e) {
                Globals_1.default.error(e.message);
                resolve();
            }
        }));
    });
}
exports.default = commandTransfer;
;
