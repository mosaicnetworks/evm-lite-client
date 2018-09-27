"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
const JSONBig = require("json-bigint");
const evmlc_1 = require("../evmlc");
const functions_1 = require("../utils/functions");

function commandTransfer(evmlc, config) {
    return evmlc.command('transfer').alias('t')
        .option('-v, --value <value>', 'value to send')
        .option('-t, --to <address>', 'address to send to')
        .option('-f, --from <address>', 'address to send from')
        .description('transfer <value> to <to> from <from>')
        .types({
            string: ['t', 'to', 'f', 'from'],
        })
        .action((args) => {
            return new Promise((resolve) => {
                if (evmlc_1.node) {
                    if (args.options && args.options.from && args.options.to) {
                        if (evmlc_1.node) {
                            config.defaults.from = args.options.from;
                            evmlc_1.node.defaultAddress = config.defaults.from;
                            let transaction = evmlc_1.node.transfer(args.options.to, args.options.value || 0).gas(1000000).gasPrice(0);
                            if (config.defaults.gas && config.defaults.gasPrice) {
                                // @ts-ignore
                                transaction
                                    .gas(config.defaults.gas)
                                    .gasPrice(config.defaults.gasPrice)
                                    .send()
                                    .then((receipt) => {
                                        functions_1.success(receipt.transactionHash);
                                    });
                            }
                            functions_1.success(JSONBig.stringify(transaction.tx, null, 2));
                            resolve();
                        }
                    }
                    else {
                        functions_1.error('Provide options.');
                        resolve();
                    }
                }
                else {
                    functions_1.error('Not connected.');
                    resolve();
                }
            });
        });
}

exports.default = commandTransfer;
;
