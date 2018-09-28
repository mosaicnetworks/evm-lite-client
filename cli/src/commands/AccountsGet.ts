import * as Vorpal from "vorpal";
import {Account} from '../../../index';
import * as ASCIITable from 'ascii-table';
import * as JSONBig from 'json-bigint';
import {connect, node} from "../evmlc";
import {error, info} from "../utils/functions";


export default function commandAccountsGet(evmlc: Vorpal, config) {
    return evmlc.command('accounts get').alias('a g')
        .option('-a, --address <address>', 'Address to fetch account of.')
        .types({
            string: ['a', 'address']
        })
        .action((args: Vorpal.Args): Promise<void> => {
            return connect().then(() => {
                if (args.options.address) {
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
                    return new Promise<void>(resolve => {
                        error('Provide address to get. -a, --address');
                        resolve();
                    });
                }
            });
        })
        .description('Get an account.');
};