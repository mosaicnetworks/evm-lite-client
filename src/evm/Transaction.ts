import * as JSONBig from 'json-bigint'

import {TX, TXReceipt} from "../misc/Interfaces";
import Controller from "../Controller";
import * as utils from "../misc/utils";


export default class Transaction {
    public tx: TX;
    public receipt: TXReceipt;

    constructor(options: TX, readonly monetNode: Controller) {
        this.tx = options;
        this.receipt = undefined;
    }

    send(options: { to?: string, from?: string, value?: number, gas?: number, gasPrice?: any }): any {
        if (options.gas !== undefined || options.gasPrice !== undefined) {
            this.tx.gas = options.gas;
            this.tx.gasPrice = options.gasPrice;
        } else {
            throw Error('Gas or Gas Price not set!')
        }

        if (options.to !== undefined)
            this.tx.to = options.to;

        if (options.from !== undefined)
            this.tx.from = options.from;

        if (options.value !== undefined)
            this.tx.value = options.value;

        utils.log(utils.fgGreen, JSONBig.stringify(this.tx, null, 2));

        return this.monetNode.api.sendTx(JSONBig.stringify(this.tx))
            .then((res: string) => {
                let response: { txHash: string } = JSONBig.parse(res);

                return response.txHash
            })
            .then((txHash) => {
                return utils.sleep(2000).then(() => {
                    utils.log(utils.fgBlue, 'Requesting Receipt');
                    return this.monetNode.api.getReceipt(txHash)
                })
            })
            .then((resp: string) => {
                this.receipt = JSONBig.parse(resp);
                return this.receipt;
            })
    }

    call(options: { gas: number, gasPrice: number }) {
        this.tx.gas = options.gas;
        this.tx.gasPrice = options.gasPrice;
        return new Promise(resolve => {
            resolve(JSON.stringify(this.tx));
        })
    }
}