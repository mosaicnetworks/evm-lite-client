"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils = require("../misc/utils");
const JSONBig = require("json-bigint");
class Receipt {
    constructor(transactionHash, monetNode) {
        this.monetNode = monetNode;
        this.data = this._getReceipt(transactionHash);
    }
    _getReceipt(txHash) {
        utils.sleep(2000).then(() => {
            utils.log(utils.fgBlue, 'Requesting Receipt: ');
            return this.monetNode.api.getReceipt(txHash)
                .then((receipt) => {
                return JSONBig.parse(receipt);
            });
        });
        return {};
    }
}
exports.default = Receipt;
