"use strict";
/**
 * @file Transaction.js
 * @author Mosaic Networks <https://github.com/mosaicnetworks>
 * @date 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
const JSONBig = require("json-bigint");
class Transaction {
    /**
     * Transaction instance to be sent or called.
     *
     * @param {TX} _tx - The transaction options eg. gas, gas price, value...
     * @param {boolean} constant - If the transaction is constant
     * @param {Function} unpackfn - If constant unpack function
     * @param {Controller} controller - The controller class
     */
    constructor(_tx, constant, unpackfn, controller) {
        this._tx = _tx;
        this.constant = constant;
        this.unpackfn = unpackfn;
        this.controller = controller;
        this.receipt = undefined;
        if (!constant)
            this.unpackfn = undefined;
    }
    /**
     * Send transaction.
     *
     * This function will mutate the state of the EVM.
     *
     * @param {Object} options - The options to pass to the transaction
     */
    send(options) {
        if (!this.constant) {
            if (options) {
                this._tx.to = options.to || this._tx.to;
                this._tx.from = options.from || this._tx.from;
                this._tx.gas = options.gas || this._tx.gas;
                this._tx.value = options.value || this._tx.value;
                if (options.gasPrice !== undefined && options.gasPrice >= 0) {
                    this._tx.gasPrice = options.gasPrice;
                }
            }
            if (this._tx.gas != null && this._tx.gasPrice != null) {
                return this.controller.api.sendTx(JSONBig.stringify(this._tx))
                    .then((res) => {
                    let response = JSONBig.parse(res);
                    return response.txHash;
                })
                    .then((txHash) => {
                    return new Promise((resolve) => setTimeout(resolve, 2000))
                        .then(() => {
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
        else {
            throw new Error('Transaction does not mutate state. Use `call()` instead');
        }
    }
    /**
     * Call transaction.
     *
     * This function will not mutate the state of the EVM.
     *
     * @param {Object} options - The options to pass to the transaction
     */
    call(options) {
        if (this.constant) {
            if (options) {
                this._tx.to = options.to || this._tx.to;
                this._tx.from = options.from || this._tx.from;
                this._tx.gas = options.gas || this._tx.gas;
                this._tx.value = options.value || this._tx.value;
                if (options.gasPrice !== undefined && options.gasPrice >= 0) {
                    this._tx.gasPrice = options.gasPrice;
                }
            }
            if (this._tx.gas != null && this._tx.gasPrice != null) {
                return this.controller.api.call(JSONBig.stringify(this._tx))
                    .then((response) => {
                    return JSONBig.parse(response);
                })
                    .then((obj) => {
                    return this.unpackfn(Buffer.from(obj.data).toString());
                });
            }
            else {
                throw new Error('gas & gas price not set');
            }
        }
        else {
            throw new Error('Transaction mutates state. Use `send()` instead');
        }
    }
    /**
     * Return transaction as string.
     *
     * @returns {string} Transaction as string
     */
    toString() {
        return JSONBig.stringify(this._tx);
    }
    /**
     * Sets the from of the transaction.
     *
     * @param {string} from - The from address
     * @returns {Transaction} The transaction
     */
    from(from) {
        this._tx.from = from;
        return this;
    }
    /**
     * Sets the to of the transaction.
     *
     * @param {string} to - The to address
     * @returns {Transaction} The transaction
     */
    to(to) {
        this._tx.to = to;
        return this;
    }
    /**
     * Sets the value of the transaction.
     *
     * @param {number} value - The value of tx
     * @returns {Transaction} The transaction
     */
    value(value) {
        this._tx.value = value;
        return this;
    }
    /**
     * Sets the gas of the transaction.
     *
     * @param {number} gas - The gas of tx
     * @returns {Transaction} The transaction
     */
    gas(gas) {
        this._tx.gas = gas;
        return this;
    }
    /**
     * Sets the gas price of the transaction.
     *
     * @param {number} gasPrice - The gas price of tx
     * @returns {Transaction} The transaction
     */
    gasPrice(gasPrice) {
        this._tx.gasPrice = gasPrice;
        return this;
    }
    /**
     * Sets the data of the transaction.
     *
     * @param {string} data - The data of tx
     * @returns {Transaction} The transaction
     */
    data(data) {
        this._tx.data = data;
        return this;
    }
}
exports.default = Transaction;
