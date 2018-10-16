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
                let l = session.log().withCommand('accounts get');

                try {
                    let accountTable = new ASCIITable().setHeading('#', 'Address', 'Balance', 'Nonce');
                    let interactive = args.options.interactive || session.interactive;
                    let formatted = args.options.formatted || false;
                    let connection = await session.connect(args.options.host, args.options.port);
                    let questions = [
                        {
                            name: 'address',
                            type: 'input',
                            required: true,
                            message: 'Address: '
                        }
                    ];

                    if (interactive) {
                        l.append('mode', 'interactive');
                        let {address} = await inquirer.prompt(questions);

                        args.address = address;
                    }

                    if (!args.address) {
                        l.append('error', 'no account address provided');
                        Globals.error('Provide an address. Usage: accounts get <address>');
                    } else {
                        l.append('address', args.address);
                        let account: BaseAccount = await connection.getRemoteAccount(args.address);

                        if (formatted) {
                            l.append('formatted', 'true');
                            accountTable.addRow('1', account.address, account.balance, account.nonce);
                            Globals.success(accountTable.toString());
                        } else {
                            l.append('formatted', 'false');
                            Globals.success(JSONBig.stringify(account))
                        }

                    }
                } catch (err) {
                    l.append('status', 'failed');
                    if (typeof err === 'object') {
                        l.append(err.name, err.text);
                        console.log(err);
                    } else {
                        l.append('error', err);
                        Globals.error(err);
                    }
                }
                l.write();
                resolve();
            });
        });

};