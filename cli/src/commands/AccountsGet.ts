import * as Vorpal from "vorpal";
import * as ASCIITable from 'ascii-table';
import * as JSONBig from 'json-bigint';

import {connect, node} from "../evmlc";
import {error, info} from "../utils/functions";

import {Account} from '../../../index';


/**
 * Should return a Vorpal command instance used for getting an account.
 *
 * This function should return a Vorpal command which should get an account
 * from the `/account/<address>` endpoint and parse it into an ASCII table.
 *
 * @param {Vorpal} evmlc - The command line object.
 * @param {Object} config - A JSON of the TOML config file.
 * @returns Vorpal Command instance
 */
export default function commandAccountsGet(evmlc: Vorpal, config) {
    return evmlc.command('accounts get').alias('a g')
        .option('-a, --address <address>', 'Address to fetch account of.')
        .types({
            string: ['a', 'address']
        })
        .action((args: Vorpal.Args): Promise<void> => {

            // connect to API endpoints
            return connect().then(() => {

                if (args.options.address) {

                    // request JSON from 'account/<address>'
                    return node.api.getAccount(args.options.address).then((a: string) => {

                        let counter: number = 0;
                        let accountsTable: ASCIITable = new ASCIITable();

                        let account: {
                            address: string,
                            balance: number,
                            nonce: number
                        } = JSONBig.parse(a);

                        accountsTable
                            .setHeading('#', 'Account Address', 'Balance', 'Nonce')
                            .addRow(counter, account.address, account.balance, account.nonce);

                        info(accountsTable.toString());

                    });

                } else {

                    // if -a or --address are not provided
                    return new Promise<void>(resolve => {

                        error('Provide address to get. -a, --address');
                        resolve();

                    });

                }

            });
        })
        .description('Get an account.');

};