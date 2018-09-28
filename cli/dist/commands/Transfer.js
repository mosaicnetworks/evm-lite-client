"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JSONBig = require("json-bigint");
const evmlc_1 = require("../evmlc");
const functions_1 = require("../utils/functions");
function commandTransfer(evmlc, config) {
    return evmlc.command('transfer').alias('t')
        .option('-v, --value <value>', 'value to send')
        .option('-t, --to <address>', 'address to send to')
        .option('-f, --from <address>', 'address to send from')
        .types({
        string: ['t', 'to', 'f', 'from'],
    })
        .action((args) => {
        return evmlc_1.connect().then(() => {
            return new Promise((resolve) => {
                if (evmlc_1.node) {
                    if (args.options && args.options.from && args.options.to) {
                        if (evmlc_1.node) {
                            evmlc_1.node.defaultAddress = args.options.from;
                            let transaction = evmlc_1.node
                                .transfer(args.options.from, args.options.to, args.options.value || 0);
                            transaction
                                .gas(100000)
                                .gasPrice(0)
                                .send()
                                .then((receipt) => {
                                functions_1.success(receipt.transactionHash);
                                resolve();
                            })
                                .catch((err) => {
                                functions_1.error(JSONBig.stringify(err));
                                resolve();
                            });
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
    })
        .description('Transfer token(s) to address.');
}
exports.default = commandTransfer;
;
