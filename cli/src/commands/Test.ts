import * as Vorpal from "vorpal";

import {Account} from '../../../index';


export default function template(evmlc: Vorpal, config) {
    return evmlc.command('test').alias('test')
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>(resolve => resolve());
        })
        .description('Testing purposes.');
};

// return connect().then(() => {
//
//     // connect to '/accounts'
//     return node.api.getAccounts().then((accounts: string) => {
//
//         // used to number the accounts
//         let counter: number = 0;
//
//         // set accounts of client to accounts fetched
//         node.accounts = JSONBig.parse(accounts).accounts;
//
//         if (node.accounts) {
//             let accountsTable: ASCIITable = new ASCIITable()
//                 .setHeading('#', 'Account Address', 'Balance', 'Nonce');
//
//             // add accounts to ASCII table
//             node.accounts.map((account: Account) => {
//                 counter++;
//                 accountsTable.addRow(counter, account.address, account.balance, account.nonce);
//             });
//
//             info(accountsTable.toString());
//         } else {
//
//             // no accounts returned
//             warning('No accounts.');
//
//         }
//
//     });
//
// });