import * as Vorpal from "vorpal";
import * as inquirer from 'inquirer';
import * as JSONBig from 'json-bigint';

import Globals from "../utils/Globals";
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
        .option('-h, --host <ip>', 'override config parameter host')
        .option('-p, --port <port>', 'override config parameter port')
        .types({
            string: ['t', 'to', 'f', 'from', 'h', 'host'],
        })
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>(async (resolve) => {
                try {
                    let interactive = args.options.interactive || session.interactive;
                    let connection = await session.connect(args.options.host, args.options.port);
                    let accounts = await session.keystore.decrypt(connection);
                    let questions = [
                        {
                            name: 'from',
                            type: 'list',
                            message: 'From: ',
                            choices: accounts.map((account) => account.address)
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

                    if (interactive) {
                        tx = await inquirer.prompt(questions)
                    } else {
                        tx.from = args.options.from || undefined;
                        tx.to = args.options.to || undefined;
                        tx.value = args.options.value || undefined;
                        tx.gas = args.options.gas || session.config.data.defaults.gas || 100000;
                        tx.gasPrice = args.options.gasprice || session.config.data.defaults.gasPrice || 0;
                    }

                    if (!tx.from && !tx.to && !tx.value) {
                        Globals.error('Provide from, to and a value.');
                        resolve();
                    }

                    let account = accounts.find((acc) => acc.address === tx.from);

                    if (!account) {
                        Globals.error('Cannot find associated local account.');
                        resolve();
                    }

                    tx.chainId = 1;
                    tx.nonce = account.nonce;

                    let signed = await account.signTransaction(tx);
                    let txHash: any = JSONBig.parse(await connection.api.sendRawTx(signed.rawTransaction));

                    tx.txHash = txHash.txHash;

                    session.database.transactions.add(tx);
                    session.database.save();

                    Globals.success(`Transaction submitted.`);
                } catch (err) {
                    (typeof err === 'object') ? console.log(err) : Globals.error(err);
                }
                resolve();
            });
        })

};