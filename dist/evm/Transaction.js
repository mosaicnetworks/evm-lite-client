"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JSONBig = require("json-bigint");
const utils = require("../misc/utils");
class Transaction {
    constructor(options, monetNode) {
        this.monetNode = monetNode;
        this.tx = options;
        this.receipt = undefined;
    }
    send(options) {
        if (options.gas !== undefined || options.gasPrice !== undefined) {
            this.tx.gas = options.gas;
            this.tx.gasPrice = options.gasPrice;
        }
        else {
            throw Error('Gas or Gas Price not set!');
        }
        if (options.to !== undefined)
            this.tx.to = options.to;
        if (options.from !== undefined)
            this.tx.from = options.from;
        if (options.value !== undefined)
            this.tx.value = options.value;
        utils.log(utils.fgGreen, JSONBig.stringify(this.tx, null, 2));
        return this.monetNode.api.sendTx(JSONBig.stringify(this.tx))
            .then((res) => {
            let response = JSONBig.parse(res);
            return response.txHash;
        })
            .then((txHash) => {
            return utils.sleep(2000).then(() => {
                utils.log(utils.fgBlue, 'Requesting Receipt');
                return this.monetNode.api.getReceipt(txHash);
            });
        })
            .then((resp) => {
            this.receipt = JSONBig.parse(resp);
            return this.receipt;
        });
    }
    call(options) {
        this.tx.gas = options.gas;
        this.tx.gasPrice = options.gasPrice;
        return new Promise(resolve => {
            resolve(JSON.stringify(this.tx));
        });
    }
}
exports.default = Transaction;
