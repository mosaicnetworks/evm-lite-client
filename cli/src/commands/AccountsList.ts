import * as Vorpal from "vorpal";
import {Account} from '../../../index';
import * as ASCIITable from 'ascii-table';
import * as JSONBig from 'json-bigint';
import {node} from "../evmlc";
import {info, warning} from "../utils/functions";


export default function commandAccountsCreate(evmlc: Vorpal, config) {
    return evmlc.command('accounts list').alias('a l')
        .description('list all accounts')
        .action((): Promise<void> => {
            return node.api.getAccounts().then((accounts: string) => {
                let counter: number = 0;
                let accountsTable: ASCIITable = new ASCIITable();

                node.accounts = JSONBig.parse(accounts).accounts;

                if (node.accounts) {
                    accountsTable
                        .setHeading('', 'Account Address', 'Balance', 'Nonce');

                    node.accounts.map((account: Account) => {
                        counter++;
                        accountsTable.addRow(counter, account.address, account.balance, account.nonce);
                    });
                    info(accountsTable.toString());
                } else {
                    warning('No accounts.')
                }
            });
        });
};