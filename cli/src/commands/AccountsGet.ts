import * as Vorpal from "vorpal";
import * as JSONBig from 'json-bigint';
import * as inquirer from 'inquirer';

import Globals, {BaseAccount} from "../utils/Globals";
import Session from "../classes/Session";


export default function commandAccountsGet(evmlc: Vorpal, session: Session) {

    let description =
        'Gets account balance and nonce from a node with a valid connection.';

    return evmlc.command('accounts get [address]').alias('a g')
        .description(description)
        .option('-f, --formatted', 'format output')
        .option('-i, --interactive', 'use interactive mode')
        .types({
            string: ['_']
        })
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>(async (resolve) => {
                try {
                    let interactive = args.options.interactive || session.interactive;
                    let formatted = args.options.formatted || false;
                    let connection = await session.connect();
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

                    if (!args.address && !interactive) {
                        Globals.error('Provide an address. Usage: accounts get <address>');
                        resolve();
                    }

                    let account: BaseAccount = await connection.getRemoteAccount(args.address);

                    formatted ? console.table(account) : Globals.info(JSONBig.stringify(account));
                } catch (err) {
                    (typeof err === 'object') ? console.log(err) : Globals.error(err);
                }
                resolve();
            });
        });

};