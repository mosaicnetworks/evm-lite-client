"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
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
     * Sets the from of the transaction.
     *
     * @param {string} from The from address
     * @returns {Transaction} The transaction
     */
    from(from) {
        this.tx.from = from;
        return this;
    }

    /**
     * Sets the to of the transaction.
     *
     * @param {string} to The to address
     * @returns {Transaction} The transaction
     */
    to(to) {
        this.tx.to = to;
        return this;
    }

    /**
     * Sets the value of the transaction.
     *
     * @param {number} value The value of tx
     * @returns {Transaction} The transaction
     */
    value(value) {
        this.tx.value = value;
        return this;
    }

    /**
     * Sets the gas of the transaction.
     *
     * @param {number} gas The gas of tx
     * @returns {Transaction} The transaction
     */
    gas(gas) {
        this.tx.gas = gas;
        return this;
    }

    /**
     * Sets the gas price of the transaction.
     *
     * @param {number} gasPrice The gas price of tx
     * @returns {Transaction} The transaction
     */
    gasPrice(gasPrice) {
        this.tx.gasPrice = gasPrice;
        return this;
    }

    /**
     * Sets the data of the transaction.
     *
     * @param {number} data The data of tx
     * @returns {Transaction} The transaction
     */
    data(data) {
        this.tx.data = data;
        return this;
    }
    /**
     * Send transaction.
     *
     * This function will mutate the state of the EVM.
     *
     * @param {Object} options
     */
    send(options) {
        if (options) {
            this.tx.to = options.to || this.tx.to;
            this.tx.from = options.from || this.tx.from;
            this.tx.gas = options.gas || this.tx.gas;
            if (options.gasPrice !== undefined && options.gasPrice >= 0) {
                this.tx.gasPrice = options.gasPrice;
            }
            this.tx.value = options.value || this.tx.value;
        }
        utils.log(utils.fgGreen, JSONBig.stringify(this.tx, null, 2));
        if (this.tx.gas != null && this.tx.gasPrice != null) {
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
        else {
            throw new Error('gas & gas price not set');
        }
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
