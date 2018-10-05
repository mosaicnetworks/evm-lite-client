"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer = require("inquirer");
const evmlc_1 = require("../evmlc");
const functions_1 = require("../utils/functions");
/**
 * Should return a Vorpal command instance used for transferring tokens.
 *
 * This function should return a Vorpal command which should transfer
 * specified value to the desired to address.
 *
 * @param {Vorpal} evmlc - The command line object.
 * @param {Object} config - A JSON of the TOML config file.
 * @returns Vorpal Command instance
 */
function commandTransfer(evmlc, config) {
    return evmlc.command('transfer').alias('t')
        .option('-i, --interactive', 'value to send')
        .option('-v, --value <value>', 'value to send')
        .option('-t, --to <address>', 'address to send to')
        .option('-f, --from <address>', 'address to send from')
        .types({
            string: ['t', 'to', 'f', 'from'],
        })
        .action((args) => {
            return new Promise((resolve) => {
                // connect to API endpoints
                return evmlc_1.connect().then((node) => {
                    functions_1.decryptLocalAccounts(node, config.storage.keystore, config.storage.password)
                        .then((accounts) => {
                            let handleTransfer = (tx) => {
                                let account = accounts.find((acc) => {
                                    return acc.address === tx.from;
                                });
                                tx.chainId = 1;
                                tx.nonce = account.nonce;
                                account.signTransaction(tx)
                                    .then((signed) => {
                                        node.api.sendRawTx(signed.rawTransaction)
                                            .then(resp => {
                                                functions_1.success(`Transferred.`);
                                                resolve();
                                            })
                                            .catch(err => {
                                                console.log(err);
                                                resolve();
                                            });
                                    });
                            };
                            let i = args.options.interactive || evmlc_1.interactive;
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
                                    default: '1000000',
                                    message: 'Gas: '
                                },
                                {
                                    name: 'gasPrice',
                                    type: 'input',
                                    default: '0',
                                    message: 'Gas Price: '
                                }
                            ];
                            if (i) {
                                inquirer.prompt(questions)
                                    .then(tx => {
                                        handleTransfer(tx);
                                    });
                            }
                            else {
                                let tx = {};
                                tx.from = args.options.from || undefined;
                                tx.to = args.options.to || undefined;
                                tx.value = args.options.value || undefined;
                                tx.gas = config.defaults.gas || 100000;
                                tx.gasPrice = config.defaults.gasPrice || 0;
                                if (tx.from && tx.to && tx.value) {
                                    handleTransfer(tx);
                                }
                            }
                        });
                });
            });
        })
        .description('Transfer token(s) to address.');
}
exports.default = commandTransfer;
;
