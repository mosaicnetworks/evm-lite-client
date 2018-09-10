import * as utils from "../misc/utils";
import Controller from "../Controller";
import * as JSONBig from 'json-bigint'


export default class Receipt {

    readonly data: {};

    constructor(transactionHash: string, readonly monetNode: Controller) {
        this.data = this._getReceipt(transactionHash)
    }

    private _getReceipt(txHash: string): {} {
        utils.sleep(2000).then(() => {
            utils.log(utils.fgBlue, 'Requesting Receipt: ');
            return this.monetNode.api.getReceipt(txHash)
                .then((receipt) => {
                    return JSONBig.parse(receipt);
                });
        });
        return {}
    }

}