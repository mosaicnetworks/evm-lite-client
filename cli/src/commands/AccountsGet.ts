import * as Vorpal from "vorpal";
import * as JSONBig from 'json-bigint';
import * as inquirer from 'inquirer';
import * as ASCIITable from 'ascii-table';

import Globals, {BaseAccount} from "../utils/Globals";
import Session from "../classes/Session";


export default function commandAccountsGet(evmlc: Vorpal, session: Session) {

    let description =
        'Gets account balance and nonce from a node with a valid connection.';

    return evmlc.command('accounts get [address]').alias('a g')
        .description(description)
        .option('-f, --formatted', 'format output')
        .option('-i, --interactive', 'use interactive mode')
        .option('-h, --host <ip>', 'override config parameter host')
        .option('-p, --port <port>', 'override config parameter port')
        .types({
            string: ['_', 'h', 'host']
        })
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>(async (resolve) => {
                let connection = await session.connect(args.options.host, args.options.port);

                if (!connection) resolve();

                let interactive = args.options.interactive || session.interactive;
                let formatted = args.options.formatted || false;
                let questions = [
                    {
                        name: 'address',
                        type: 'input',
                        required: true,
                        message: 'Address: '
                    }
                ];

                if (interactive) {
                    let {address} = await inquirer.prompt(questions);
                    args.address = address;
                }

                if (!args.address) {
                    Globals.error('Provide an address. Usage: accounts get <address>');
                    resolve();
                }

                let account = await connection.api.getAccount(args.address);

                if (account) {
                    if (formatted) {
                        let table = new ASCIITable().setHeading('Address', 'Balance', 'Nonce');
                        table.addRow(account.address, account.balance, account.nonce);
                        Globals.success(table.toString());
                    } else {
                        Globals.success(JSONBig.stringify(account))
                    }
                }

                resolve();
            });
        });

};