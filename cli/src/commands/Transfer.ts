import * as Vorpal from "vorpal";
import * as JSONBig from 'json-bigint';

import {Account} from '../../../index';
import {connect, node} from "../evmlc";
import {error, success} from "../utils/functions";


export default function commandTransfer(evmlc: Vorpal, config) {
    return evmlc.command('transfer').alias('t')
        .option('-v, --value <value>', 'value to send')
        .option('-t, --to <address>', 'address to send to')
        .option('-f, --from <address>', 'address to send from')
        .types({
            string: ['t', 'to', 'f', 'from'],
        })
        .action((args: Vorpal.Args): Promise<void> => {
            return connect().then(() => {
                return new Promise<void>((resolve) => {
                    if (node) {
                        if (args.options && args.options.from && args.options.to) {
                            if (node) {
                                node.defaultAddress = args.options.from;

                                let transaction = node
                                    .transfer(args.options.from, args.options.to, args.options.value || 0);

                                transaction
                                    .gas(100000)
                                    .gasPrice(0)
                                    .send()
                                    .then((receipt) => {
                                        success(receipt.transactionHash);
                                        resolve();
                                    })
                                    .catch((err) => {
                                        error(JSONBig.stringify(err));
                                        resolve();
                                    });
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
        })
        .description('Transfer token(s) to address.');

};