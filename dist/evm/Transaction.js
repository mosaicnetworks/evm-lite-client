"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JSONBig = require("json-bigint");
const utils_1 = require("../misc/utils");
class Transaction {
    /**
     * Transaction object to be sent or called.
     *
     * @param {TX} options The transaction options eg. gas, gas price, value...
     * @param {boolean} constant If the transaction is constant
     * @param {Function} unpackfn If constant - unpack function
     * @param {Controller} controller The controller class
     */
    constructor(options, constant, unpackfn, controller) {
        this.constant = constant;
        this.unpackfn = unpackfn;
        this.controller = controller;
        this.tx = options;
        this.receipt = undefined;
        if (!constant)
            this.unpackfn = undefined;
    }
    /**
     * Send transaction.
     *
     * This function will mutate the state of the EVM.
     *
     * @param {Object} options
     */
    send(options) {
        if (!this.constant) {
            if (options) {
                this.tx.to = options.to || this.tx.to;
                this.tx.from = options.from || this.tx.from;
                this.tx.gas = options.gas || this.tx.gas;
                this.tx.value = options.value || this.tx.value;
                if (options.gasPrice !== undefined && options.gasPrice >= 0) {
                    this.tx.gasPrice = options.gasPrice;
                }
            }
            utils_1.default.log(utils_1.default.fgGreen, JSONBig.stringify(this.tx, null, 2));
            if (this.tx.gas != null && this.tx.gasPrice != null) {
                return this.controller.api.sendTx(JSONBig.stringify(this.tx))
                    .then((res) => {
                    let response = JSONBig.parse(res);
                    return response.txHash;
                })
                    .then((txHash) => {
                    return utils_1.default.sleep(2000).then(() => {
                        utils_1.default.log(utils_1.default.fgBlue, 'Requesting Receipt');
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
     */
    call(options) {
        if (this.constant) {
            if (options) {
                this.tx.to = options.to || this.tx.to;
                this.tx.from = options.from || this.tx.from;
                this.tx.gas = options.gas || this.tx.gas;
                this.tx.value = options.value || this.tx.value;
                if (options.gasPrice !== undefined && options.gasPrice >= 0) {
                    this.tx.gasPrice = options.gasPrice;
                }
            }
            utils_1.default.log(utils_1.default.fgGreen, JSONBig.stringify(this.tx, null, 2));
            if (this.tx.gas != null && this.tx.gasPrice != null) {
                return this.controller.api.call(JSONBig.stringify(this.tx))
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
}
exports.default = Transaction;
