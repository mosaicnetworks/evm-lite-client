import * as Vorpal from "vorpal";
import * as JSONBig from 'json-bigint';

import {Account} from '../../../index';
import {node} from "../evmlc";
import {error, success} from "../utils/functions";


export default function commandTransfer(evmlc: Vorpal, config) {
    return evmlc.command('transfer').alias('t')
        .option('-v, --value <value>', 'value to send')
        .option('-t, --to <address>', 'address to send to')
        .option('-f, --from <address>', 'address to send from')
        .description('Transfer token(s) to address.')
        .types({
            string: ['t', 'to', 'f', 'from'],
        })
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>((resolve) => {
                if (node) {
                    if (args.options && args.options.from && args.options.to) {
                        if (node) {
                            config.defaults.from = args.options.from;
                            node.defaultAddress = config.defaults.from;

                            let transaction = node.transfer(args.options.to, args.options.value || 0).gas(1000000).gasPrice(0);

                            if (config.defaults.gas && config.defaults.gasPrice) {
                                // @ts-ignore
                                transaction
                                    .gas(config.defaults.gas)
                                    .gasPrice(config.defaults.gasPrice)
                                    .send()
                                    .then((receipt) => {
                                        success(receipt.transactionHash);
                                    });
                            }
                            success(JSONBig.stringify(transaction.tx, null, 2));
                            resolve();
                        }
                    } else {
                        error('Provide options.');
                        resolve();
                    }
                } else {
                    error('Not connected.');
                    resolve();
                }
            });

        });
};