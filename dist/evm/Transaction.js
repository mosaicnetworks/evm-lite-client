"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JSONBig = require("json-bigint");
const utils = require("../misc/utils");
class Transaction {
    /**
     * Transaction object to be sent or called.
     *
     * @param {TX} options The transaction options eg. gas, gas price, value...
     * @param {Controller} controller The controller class
     */
    constructor(options, controller) {
        this.controller = controller;
        this.tx = options;
        this.receipt = undefined;
    }
    /**
     * Send transaction.
     *
     * This function will mutate the state of the EVM.
     *
     * @param {Object} options
     */
    send(options) {
        if (options.gas !== undefined || options.gasPrice !== undefined) {
            this.tx.gas = options.gas;
            this.tx.gasPrice = options.gasPrice;
        }
        else {
            throw Error('Gas or Gas Price not set!');
        }
        this.tx.to = options.to || this.tx.to;
        this.tx.from = options.from || this.tx.from;
        this.tx.value = options.value || this.tx.value;
        utils.log(utils.fgGreen, JSONBig.stringify(this.tx, null, 2));
        return this.controller.api.sendTx(JSONBig.stringify(this.tx))
            .then((res) => {
                let response = JSONBig.parse(res);
                return response.txHash;
            })
            .then((txHash) => {
                return utils.sleep(2000).then(() => {
                    utils.log(utils.fgBlue, 'Requesting Receipt');
                    return this.controller.api.getReceipt(txHash);
                });
            })
            .then((resp) => {
                this.receipt = JSONBig.parse(resp);
                return this.receipt;
            });
    }
    /**
     * Call transaction.
     *
     * This function will not mutate the state of the EVM.
     *
     * @param {Object} options
     */
    call(options) {
        this.tx.gas = options.gas;
        this.tx.gasPrice = options.gasPrice;
        return new Promise(resolve => {
            resolve(JSON.stringify(this.tx));
        });
    }
}
exports.default = Transaction;
