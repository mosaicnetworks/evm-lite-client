import * as Vorpal from "vorpal";
import * as inquirer from 'inquirer';

import {error, success} from "../utils/globals";

import Session from "../classes/Session";


export default function commandTransfer(evmlc: Vorpal, session: Session) {

    let description =
        'Initiate a transfer of token(s) to an address. Default values for gas and gas prices are set in the' +
        ' configuration file.';

    return evmlc.command('transfer').alias('t')
        .description(description)
        .option('-i, --interactive', 'value to send')
        .option('-v, --value <value>', 'value to send')
        .option('-g, --gas <value>', 'gas to send at')
        .option('-gp, --gasprice <value>', 'gas price to send at')
        .option('-t, --to <address>', 'address to send to')
        .option('-f, --from <address>', 'address to send from')
        .types({
            string: ['t', 'to', 'f', 'from'],
        })
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>(async (resolve) => {
                try {
                    let interactive = args.options.interactive || session.interactive;
                    let connection = await session.connect();
                    let accounts = await session.keystore.decrypt(connection);
                    let choices: string[] = accounts.map((account) => {
                        return account.address;
                    });
                    let questions = [
                        {
                            name: 'from',
                            type: 'list',
                            message: 'From: ',
                            choices: choices
                        },
                        {
                            name: 'to',
                            type: 'input',
                            message: 'To'
                        },
                        {
                            name: 'value',
                            type: 'input',
                            default: '100',
                            message: 'Value: '
                        },
                        {
                            name: 'gas',
                            type: 'input',
                            default: session.config.data.defaults.gas || 10000,
                            message: 'Gas: '
                        },
                        {
                            name: 'gasPrice',
                            type: 'input',
                            default: session.config.data.defaults.gasPrice || 0,
                            message: 'Gas Price: '
                        }
                    ];
                    let tx: any = {};

                    tx.from = args.options.from || undefined;
                    tx.to = args.options.to || undefined;
                    tx.value = args.options.value || undefined;
                    tx.gas = args.options.gas || session.config.data.defaults.gas || 100000;
                    tx.gasPrice = args.options.gasprice || session.config.data.defaults.gasPrice || 0;

                    if (interactive) {
                        tx = await inquirer.prompt(questions)
                    }

                    if (!tx.from && !tx.to && !tx.value) {
                        error('Provide from, to and a value.');
                        resolve();
                    }

                    let account = accounts.find((acc) => {
                        return acc.address === tx.from;
                    });

                    if (!account) {
                        error('Cannot find associated local account.')
                    }

                    tx.chainId = 1;
                    tx.nonce = account.nonce;

                    let signed = await account.signTransaction(tx);

                    let txHash = await connection.api.sendRawTx(signed.rawTransaction);

                    console.log(txHash);
                    success(`Transaction submitted.`);
                } catch (err) {
                    (typeof err === 'object') ? console.log(err) : error(err);
                }
                resolve();
            });
        })

};