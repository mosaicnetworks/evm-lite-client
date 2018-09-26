#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tomlify = require("tomlify-j0.4");
const toml = require("toml");
const Vorpal = require("vorpal");
const ASCIITable = require("ascii-table");
const JSONBig = require("json-bigint");
const Chalk = require("chalk");
const fs = require("fs");
const index_1 = require("../../index");
const l = console.log;
const evml = new Vorpal();
const chalk = Chalk.default;
let config;
const success = (message) => l(chalk.green(message));
const warning = (message) => l(chalk.yellow(message));
const error = (message) => l(chalk.red(message));
const info = (message) => l(chalk.blue(message));
let node = null;
let path = '../evml_cli_config.toml';
const updateToConfigFile = () => {
    fs.writeFile(path, tomlify.toToml(config, { spaces: 2 }), function (err) {
        if (err)
            throw err;
    });
};
const createOrReadConfigFile = () => {
    let content = `title = "EVM-Lite CLI Config"

[connection]
host = "127.0.0.1"
port = 8080

[defaults]
from = ""
gas = 0
gasPrice = 0

[storage]
keystore = "/Users/danu/Library/EVMLITE/eth/keystore"
password = "/Users/danu/Library/EVMLITE/eth/pwd.txt"`;
    if (fs.existsSync(path)) {
        return new Promise(resolve => {
            fs.readFile(path, 'utf8', (err, contents) => {
                if (err)
                    throw err;
                config = toml.parse(contents);
                resolve();
            });
        });
    }
    else {
        return new Promise(resolve => {
            fs.writeFile(path, content, function (err) {
                if (err)
                    throw err;
                config = toml.parse(content);
                resolve();
            });
        });
    }
};
const connect = () => {
    if (node === null) {
        node = new index_1.Controller(config.connection.host, config.connection.port || 8080);
        return node.api.getAccounts().then((accounts) => {
            node.accounts = JSONBig.parse(accounts).accounts;
        })
            .catch((err) => {
            node = null;
            error(err);
        });
    }
    else {
        return new Promise((resolve) => {
            resolve();
        });
    }
};
evml.version("0.1.0");
evml.command('config')
    .description('for testing purposes')
    .action((args) => {
    return new Promise(resolve => {
        l(config);
        resolve();
    });
});
evml.command('defaults').alias('d')
    .description('set default transaction values')
    .option('-p, --parameter <parameter>', 'default parameter to change value of')
    .option('-v, --value <value>', 'value to set parameter')
    .types({
    string: ['p', 'parameter', 'v', 'value']
})
    .action((args) => {
    if (args.options.parameter && args.options.value) {
        switch (args.options.parameter.toLowerCase()) {
            case 'gasprice':
                return new Promise(resolve => {
                    if (args.options.value) {
                        config.defaults.gasPrice = parseInt(args.options.value);
                        updateToConfigFile();
                    }
                    else {
                        error('No value was provided.');
                    }
                    resolve();
                });
            case 'gas':
                return new Promise(resolve => {
                    if (args.options.value) {
                        config.defaults.gas = parseInt(args.options.value);
                        updateToConfigFile();
                    }
                    else {
                        error('No value was provided.');
                    }
                    resolve();
                });
            case 'from':
                return new Promise(resolve => {
                    if (args.options.value) {
                        config.defaults.from = args.options.value;
                        updateToConfigFile();
                    }
                    else {
                        error('No value was provided.');
                    }
                    resolve();
                });
            default:
                return new Promise((resolve) => {
                    error('Provide options.');
                    resolve();
                });
        }
    }
    else {
        return new Promise(resolve => {
            let defaultsTable = new ASCIITable()
                .setHeading('Parameter', 'Value')
                .addRow('From', config.defaults.from)
                .addRow('Gas', config.defaults.gas)
                .addRow('Gas Price', config.defaults.gasPrice);
            info(defaultsTable.toString());
            resolve();
        });
    }
});
evml.command('accounts [action]').alias('a')
    .autocomplete(['list', 'create', 'get'])
    .option('-a, --argument <argument>', 'param for action')
    .option('-l, --local', 'param for action')
    .option('-p, --password <password>', 'param for action')
    .types({
    string: ['a', 'argument', 'p', 'password']
})
    .description('displays all accounts')
    .action((args) => {
    if (node !== null) {
        args.action = args.action || 'list';
        switch (args.action.toLowerCase()) {
            case 'create':
                return new Promise((resolve) => {
                    let getPassword = () => {
                        return new Promise((resolve) => {
                            fs.readFile(config.storage.password, 'utf8', (err, contents) => {
                                if (err)
                                    throw err;
                                resolve(contents);
                            });
                        });
                    };
                    let account = new index_1.Account();
                    if (!args.options.local && args.options.password) {
                        error('Cannot use custom password without local flag.');
                    }
                    else if (!args.options.local && !args.options.password) {
                        getPassword().then((password) => {
                            let newAccountTable = new ASCIITable('New Account');
                            let encryptedAccount = account.encrypt(password);
                            newAccountTable
                                .addRow('Address', account.address)
                                .addRow('Private Key', account.privateKey);
                            fs.writeFile(`${config.storage.keystore}/${account.address}`, JSONBig.stringify(encryptedAccount), (error) => {
                                if (error)
                                    throw error;
                            });
                            success(newAccountTable.toString());
                            resolve();
                        });
                    }
                    else {
                        if (args.options.local && !args.options.password) {
                            error('Provide password to encrypt locally with -p, --password');
                        }
                        else {
                            success(JSONBig.stringify(account.encrypt(args.options.password)));
                        }
                        resolve();
                    }
                });
            case 'get':
                if (args.options.argument) {
                    return node.api.getAccount(args.options.param).then((a) => {
                        let accountsTable = new ASCIITable();
                        let account = JSONBig.parse(a);
                        accountsTable
                            .setHeading('Account Address', 'Balance', 'Nonce')
                            .addRow(account.address, account.balance, account.nonce);
                        info(accountsTable.toString());
                    })
                        .catch((err) => {
                        error(err);
                    });
                }
                else {
                    return new Promise((resolve) => {
                        error('Account address not provided. usage: accounts get -p <address>');
                        resolve();
                    });
                }
            case 'list':
                return node.api.getAccounts().then((accounts) => {
                    let counter = 0;
                    let accountsTable = new ASCIITable();
                    node.accounts = JSONBig.parse(accounts).accounts;
                    if (node.accounts) {
                        accountsTable
                            .setHeading('', 'Account Address', 'Balance', 'Nonce');
                        node.accounts.map((account) => {
                            counter++;
                            accountsTable.addRow(counter, account.address, account.balance, account.nonce);
                        });
                        info(accountsTable.toString());
                    }
                    else {
                        warning('No accounts.');
                    }
                });
            default:
                return new Promise((resolve) => {
                    error('Choose from `create` `get` `list`.');
                    resolve();
                });
        }
    }
    else {
        error('No connection has been established.');
        return new Promise((resolve) => resolve());
    }
});
evml.command('transfer').alias('t')
    .option('-v, --value <value>', 'value to send')
    .option('-t, --to <address>', 'address to send to')
    .option('-f, --from <address>', 'address to send from')
    .description('transfer <value> to <to> from <from>')
    .types({
    string: ['t', 'to', 'f', 'from'],
})
    .action((args) => {
    return new Promise((resolve) => {
        if (node) {
            if (args.options && args.options.from && args.options.to) {
                if (node) {
                    config.defaults.from = args.options.from;
                    node.defaultAddress = config.defaults.from;
                    let transaction = node.transfer(args.options.to, args.options.value || 0).gas(1000000).gasPrice(0);
                    if (config.defaults.gas && config.defaults.gasPrice) {
                        // @ts-ignore
                        transaction
                            .gas(config.defaults.gas)
                            .gasPrice(config.defaults.gasPrice)
                            .send()
                            .then((receipt) => {
                            success(receipt.transactionHash);
                        });
                    }
                    success(JSONBig.stringify(transaction.tx, null, 2));
                    resolve();
                }
            }
            else {
                error('Provide options.');
                resolve();
            }
        }
        else {
            error('Not connected.');
            resolve();
        }
    });
});
createOrReadConfigFile()
    .then(() => {
    connect();
})
    .then(() => {
    // evml.parse(process.argv);
    evml.delimiter('evml$').show();
});
