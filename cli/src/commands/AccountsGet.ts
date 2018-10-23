import * as Vorpal from "vorpal";
import * as JSONBig from 'json-bigint';
import * as inquirer from 'inquirer';
import * as ASCIITable from 'ascii-table';

import Staging, {execute, Message, StagedOutput, StagingFunction} from "../classes/Staging";

import Session from "../classes/Session";


export const stage: StagingFunction = (args: Vorpal.Args, session: Session): Promise<StagedOutput<Message>> => {
    return new Promise<StagedOutput<Message>>(async (resolve) => {
        let {error, success} = Staging.getStagingFunctions(args);

        let connection = await session.connect(args.options.host, args.options.port);

        if (!connection) {
            resolve(error(Staging.ERRORS.INVALID_CONNECTION));
            return;
        }

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

        if (interactive && !args.address) {
            let {address} = await inquirer.prompt(questions);
            args.address = address;
        }

        if (!args.address) {
            resolve(error(
                Staging.ERRORS.BLANK_FIELD,
                'Provide a non-empty address. Usage: accounts get <address>'
            ));
            return;
        }

        let account = await connection.api.getAccount(args.address);
        let message: string = '';

        if (!account) {
            resolve(error(
                Staging.ERRORS.FETCH_FAILED,
                'Could not fetch account: ' + args.address
            ));
            return;
        }


        if (formatted) {
            let table = new ASCIITable().setHeading('Address', 'Balance', 'Nonce');
            table.addRow(account.address, account.balance, account.nonce);
            message = table.toString();
        } else {
            message = JSONBig.stringify(account);
        }

        resolve(success(message));
    });
};

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
        .action((args: Vorpal.Args): Promise<void> => execute(stage, args, session));

};