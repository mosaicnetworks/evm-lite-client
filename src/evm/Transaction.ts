import * as JSONBig from 'json-bigint'

import * as utils from "../misc/utils";

import {TX, TXReceipt} from "../misc/Interfaces";

import Controller from "../Controller";


export default class Transaction {
    public tx: TX;
    public receipt: TXReceipt;

    /**
     * Transaction object to be sent or called.
     *
     * @param {TX} options The transaction options eg. gas, gas price, value...
     * @param {Controller} controller The controller class
     */
    constructor(options: TX, readonly controller: Controller) {
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
    send(options: { to?: string, from?: string, value?: number, gas?: number, gasPrice?: any }): any {
        if (options.gas !== undefined || options.gasPrice !== undefined) {
            this.tx.gas = options.gas;
            this.tx.gasPrice = options.gasPrice;
        } else {
            throw Error('Gas or Gas Price not set!')
        }

        this.tx.to = options.to || this.tx.to;
        this.tx.from = options.from || this.tx.from;
        this.tx.value = options.value || this.tx.value;

        utils.log(utils.fgGreen, JSONBig.stringify(this.tx, null, 2));

        return this.controller.api.sendTx(JSONBig.stringify(this.tx))
            .then((res: string) => {
                let response: { txHash: string } = JSONBig.parse(res);
                return response.txHash
            })
            .then((txHash) => {
                return utils.sleep(2000).then(() => {
                    utils.log(utils.fgBlue, 'Requesting Receipt');
                    return this.controller.api.getReceipt(txHash)
                })
            })
            .then((resp: string) => {
                this.receipt = JSONBig.parse(resp);
                return this.receipt;
            })
    }

    /**
     * Call transaction.
     *
     * This function will not mutate the state of the EVM.
     *
     * @param {Object} options
     */
    call(options: { gas: number, gasPrice: number }) {
        this.tx.gas = options.gas;
        this.tx.gasPrice = options.gasPrice;
        return new Promise(resolve => {
            resolve(JSON.stringify(this.tx));
        })
    }
}