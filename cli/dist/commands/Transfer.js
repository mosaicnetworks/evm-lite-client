"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JSONBig = require("json-bigint");
const evmlc_1 = require("../evmlc");
const functions_1 = require("../utils/functions");
let questions = [
    {
        name: 'from',
        type: 'list',
        choices: ['']
    },
    {
        name: 'to',
        type: 'input',
    },
    {
        name: 'value',
        type: 'input',
        default: '100'
    },
    {
        name: 'gas',
        type: 'input',
        default: '1000000'
    },
    {
        name: 'gasPrice',
        type: 'input',
        default: '0'
    }
];

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
            // connect to API endpoints
            return evmlc_1.connect().then(() => {
                return new Promise((resolve) => {
                    if (args.options && args.options.from && args.options.to) {
                        // set default from address of the node object
                        evmlc_1.node.defaultAddress = args.options.from;
                        let transaction = evmlc_1.node
                            .transfer(args.options.from, args.options.to, args.options.value || 0);
                        // set gas, gasprice values and send transaction
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
                    else {
                        // no options were provided
                        functions_1.error('Provide options.');
                        resolve();
                    }
                });
            });
        })
        .description('Transfer token(s) to address.');
}
exports.default = commandTransfer;
;
