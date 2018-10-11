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
const globals_1 = require("../utils/globals");
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
        .types({
        string: ['t', 'to', 'f', 'from'],
    })
        .action((args) => {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            try {
                let interactive = args.options.interactive || session.interactive;
                let connection = yield session.connect();
                let accounts = yield session.keystore.decrypt(connection);
                let choices = accounts.map((account) => {
                    return account.address;
                });
                let questions = [
                    {
                        name: 'from',
                        type: 'list',
                        message: 'From: ',
                        choices: choices
                    },
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
                        default: session.config.data.defaults.gas || 10000,
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
                tx.from = args.options.from || undefined;
                tx.to = args.options.to || undefined;
                tx.value = args.options.value || undefined;
                tx.gas = args.options.gas || session.config.data.defaults.gas || 100000;
                tx.gasPrice = args.options.gasprice || session.config.data.defaults.gasPrice || 0;
                if (interactive) {
                    tx = yield inquirer.prompt(questions);
                }
                if (!tx.from && !tx.to && !tx.value) {
                    globals_1.error('Provide from, to and a value.');
                    resolve();
                }
                let account = accounts.find((acc) => {
                    return acc.address === tx.from;
                });
                if (!account) {
                    globals_1.error('Cannot find associated local account.');
                }
                tx.chainId = 1;
                tx.nonce = account.nonce;
                let signed = yield account.signTransaction(tx);
                let txHash = yield connection.api.sendRawTx(signed.rawTransaction);
                console.log(txHash);
                globals_1.success(`Transaction submitted.`);
            }
            catch (err) {
                (typeof err === 'object') ? console.log(err) : globals_1.error(err);
            }
            resolve();
        }));
    });
}
exports.default = commandTransfer;
;
