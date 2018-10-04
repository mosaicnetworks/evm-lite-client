import * as Vorpal from "vorpal";
import * as JSONBig from 'json-bigint';

import {connect, node} from "../evmlc";
import {error, success} from "../utils/functions";

import {Account} from '../../../index';


let questions = [
    {
        name: 'from',
        type: 'list',
        choices: ['']
    },
    {
        name: 'to',
        type: 'input',
    },
    {
        name: 'value',
        type: 'input',
        default: '100'
    },
    {
        name: 'gas',
        type: 'input',
        default: '1000000'
    },
    {
        name: 'gasPrice',
        type: 'input',
        default: '0'
    }
];

/**
 * Should return a Vorpal command instance used for transferring tokens.
 *
 * This function should return a Vorpal command which should transfer
 * specified value to the desired to address.
 *
 * @param {Vorpal} evmlc - The command line object.
 * @param {Object} config - A JSON of the TOML config file.
 * @returns Vorpal Command instance
 */
export default function commandTransfer(evmlc: Vorpal, config) {
    return evmlc.command('transfer').alias('t')
        .option('-i, --interactive', 'value to send')
        .option('-v, --value <value>', 'value to send')
        .option('-t, --to <address>', 'address to send to')
        .option('-f, --from <address>', 'address to send from')
        .types({
            string: ['t', 'to', 'f', 'from'],
        })
        .action((args: Vorpal.Args): Promise<void> => {

            // connect to API endpoints
            return connect().then(() => {

                return new Promise<void>((resolve) => {

                    if (args.options && args.options.from && args.options.to) {

                        // set default from address of the node object
                        node.defaultAddress = args.options.from;

                        let transaction = node
                            .transfer(args.options.from, args.options.to, args.options.value || 0);

                        // set gas, gasprice values and send transaction
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

                    } else {

                        // no options were provided
                        error('Provide options.');
                        resolve();

                    }

                });

            });

        })
        .description('Transfer token(s) to address.');

};