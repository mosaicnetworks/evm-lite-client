import * as Vorpal from "vorpal";
import * as inquirer from 'inquirer';
import * as fs from "fs";
import * as JSONBig from 'json-bigint';

import {Account} from "../../../lib"

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
        .option('--password <password>', 'password file path')
        .option('-p, --port <port>', 'override config parameter port')
        .types({
            string: ['t', 'to', 'f', 'from', 'h', 'host'],
        })
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>(async (resolve) => {
                let connection = await session.connect(args.options.host, args.options.port);

                if (!connection) {
                    resolve();
                    return;
                }

                let interactive = args.options.interactive || session.interactive;
                let accounts = await session.keystore.all();
                let fromQ = [
                    {
                        name: 'from',
                        type: 'list',
                        message: 'From: ',
                        choices: accounts.map((account) => account.address)
                    }
                ];
                let passwordQ = [
                    {
                        name: 'password',
                        type: 'password',
                        message: 'Enter password: ',
                    }
                ];
                let restOfQs = [
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
                        default: session.config.data.defaults.gas || 100000,
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
                    let {from} = await inquirer.prompt(fromQ);
                    tx.from = from;
                } else {
                    tx.from = args.options.from || undefined;
                }

                if (!tx.from) {
                    Globals.error('`From` address cannot be blank.');
                    resolve();
                    return;
                }

                let keystore = session.keystore.get(tx.from);

                if (!keystore) {
                    Globals.error(`Cannot find keystore file of address: ${tx.from}.`);
                }

                if (args.options.password) {
                    if (!fs.existsSync(args.options.password)) {
                        Globals.error('Password file path provided does not exist.');
                        resolve();
                        return;
                    }

                    if (fs.lstatSync(args.options.password).isDirectory()) {
                        Globals.error('Password file path provided is not a file.');
                        resolve();
                        return;
                    }

                    args.options.password = fs.readFileSync(args.options.password, 'utf8');
                } else {
                    let {password} = await inquirer.prompt(passwordQ);
                    args.options.password = password;
                }

                let decrypted: Account = null;

                try {
                    decrypted = Account.decrypt(keystore, args.options.password);
                } catch (err) {
                    Globals.error('Failed decryption of account with the password provided.');
                    resolve();
                    return;
                }

                if (!decrypted) {
                    Globals.error('Oops! Something went wrong.');
                    resolve();
                    return;
                }

                if (interactive) {
                    let answers = await inquirer.prompt(restOfQs);
                    args.options.to = answers.to;
                    args.options.value = answers.value;
                    args.options.gas = answers.gas;
                    args.options.gasPrice = answers.gasPrice;
                }

                tx.to = args.options.to || undefined;
                tx.value = args.options.value || undefined;
                tx.gas = args.options.gas || session.config.data.defaults.gas || 100000;
                tx.gasPrice = args.options.gasprice || session.config.data.defaults.gasPrice || 0;

                if ((!tx.to) || !tx.value) {
                    Globals.error('Provide an address to send to and a value.');
                    resolve();
                    return;
                }

                tx.chainId = 1;
                tx.nonce = (await session.keystore.fetch(decrypted.address, connection)).nonce;

                console.log(tx);
                try {
                    let signed = await decrypted.signTransaction(tx);

                    connection.api.sendRawTx(signed.rawTransaction)
                        .then((resp) => {
                            let response: any = JSONBig.parse(resp);
                            tx.txHash = response.txHash;

                            session.database.transactions.add(tx);
                            session.database.save();

                            Globals.info(`(From) ${tx.from} -> (To) ${tx.to} (${tx.value})`);
                            Globals.success(`Transaction submitted.`);
                            resolve();
                        })
                        .catch(() => {
                            Globals.error('Ran out of gas. Current Gas: ' + parseInt(tx.gas, 16));
                            resolve();
                        })
                } catch (e) {
                    Globals.error(e.message);
                    resolve();
                }
            });
        });

};