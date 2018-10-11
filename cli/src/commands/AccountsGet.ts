import * as Vorpal from "vorpal";
import * as JSONBig from 'json-bigint';
import * as inquirer from 'inquirer';

import {BaseAccount, error, info} from "../utils/globals";

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
                    let connection = await session.connect();

                    if (interactive) {
                        let questions = [
                            {
                                name: 'address',
                                type: 'input',
                                required: true,
                                message: 'Address: '
                            }
                        ];
                        let answers = await inquirer.prompt(questions);

                        args.address = answers.address;
                    }

                    if (!args.address && !interactive) {
                        error('Provide an address. Usage: accounts get <address>');
                        resolve();
                    }

                    let account: BaseAccount = await connection.getRemoteAccount(args.address);
                    let formatted = args.options.formatted || false;

                    formatted ? console.table(account) : info(JSONBig.stringify(account));
                } catch (err) {
                    (typeof err === 'object') ? console.log(err) : error(err);
                }
                resolve();
            });
        });

};