# EVM-Lite Client (Javascript)

A Javascript client library and Command Line Interface to interact with 
EVM-Lite.

## Table of Contents

<!--ts-->
* [Table of Contents](#table-of-contents)
* [Installation](#installation)
    * [Makefile](#makefile)
    * [Dependencies](#dependencies)
        * [Client Library](#client-library)
        * [Command Line Interface](#command-line-interface)
* [Demo](#demo)
* [Configuration Settings](#configuration-settings)
* [Commands](#commands)
    * [help](#help)
    * [accounts](#accounts-create)
        * [create](#accounts-create)
        * [list](#accounts-list)
        * [get](#accounts-get)
    * [interactive](#interactive)
    * [config](#config-view)
        * [config view](#config-view)
        * [config set](#config-set)
    * [transfer](#transfer)
    * [exit](#exit)
<!--te-->

## Installation

To start any of the installation process you will need to install Node and NPM which
both come packaged with the installation from the [Node website](https://nodejs.org/en/).

This project was built with Node version:

```console
$ node -v

v10.10.0
```

and NPM version:
```console
$ npm -v

6.1.0
```

### Makefile

To install all Client and CLI dependencies along with the symlink run:

```
$ make
```

To clean all of the steps from the `make` command run:

```
$ make clean
```

This removes all dependencies for Client and CLI and also removes the symlink.

If the `make` was successful you should now be able to run:

```console
$ evmlc

  A Command Line Interface to interact with EVM-Lite.

  Current Data Directory: [...]/.evmlc

  Commands:

    help [command...]                 Provides help for a given command.
    exit                              Exits application.
    config view                       Output current configuration file as JSON.
    config set [options]              Set values of the configuration inside the data directory.
    accounts create [options]         Allows you to create and encrypt accounts locally. Created accounts will either be placed in the keystore folder inside the data directory provided by the global --datadir, -d flag or if no flag is provided, in the keystore
                                      specified in the configuration file.
    accounts list [options]           List all accounts in the local keystore directory provided by the configuration file. This command will also get a balance and nonce for all the accounts from the node if a valid connection is established.
    accounts get [options] [address]  Gets account balance and nonce from a node with a valid connection.
    interactive                       Enter into interactive mode with data directory provided by --datadir, -d or default.
    transfer [options]                Initiate a transfer of token(s) to an address. Default values for gas and gas prices are set in the configuration file.
    info [options]                    Testing purposes.
```

### Dependencies

#### Client Library

* [json-bigint](https://www.npmjs.com/package/json-bigint): Used to parse big integers.
* [solc](https://www.npmjs.com/package/solc): Solidity compiler used to compile Solidity code.
* [web3](https://www.npmjs.com/package/web3): The Ethereum web3.js library.
* [web3-eth-accounts](https://www.npmjs.com/package/web3-eth-accounts): The standalone web3 library for managing accounts.


```json
"dependencies": {
    "json-bigint": "^0.3.0",
    "solc": "^0.4.24",
    "web3": "github:ethereum/web3.js",
    "web3-eth-accounts": "^1.0.0-beta.26"
}
```

#### Command Line Interface

* [ascii-table](https://www.npmjs.com/package/ascii-table): Used to create ASCII tables.
* [chalk](https://www.npmjs.com/package/chalk): Command line formatting.
* [commander](https://www.npmjs.com/package/commander): API to build the command line interface.
* [inquirer](https://www.npmjs.com/package/inquirer): Used create interactive commands.
* [json-bigint](https://www.npmjs.com/package/json-bigint): Used to parse big integers.
* [mkdirp](https://www.npmjs.com/package/mkdirp): Used to recursively create directories.
* [toml](https://www.npmjs.com/package/toml): Used to parse TOML to JSON.
* [tomlify-j0.4](https://www.npmjs.com/package/tomlify-j0.4): Used to parse JSON to TOML.
* [vorpal](https://www.npmjs.com/package/vorpal): Provides API to build interactive command line interfaces.


```json
"dependencies": {
    "ascii-table": "0.0.9",
    "chalk": "^2.4.1",
    "commander": "^2.18.0",
    "inquirer": "latest",
    "json-bigint": "^0.3.0",
    "mkdirp": "^0.5.1",
    "toml": "^2.3.3",
    "tomlify-j0.4": "^3.0.0",
    "vorpal": "^1.12.0"
}
```

## Demo

The easiest way to change configuration file through the CLI is enter interactive mode. Which can be done with the
`interactive` or `i` command:

```console
$ evmlc interactive
  _______     ____  __       _     _ _          ____ _     ___
 | ____\ \   / /  \/  |     | |   (_) |_ ___   / ___| |   |_ _|
 |  _|  \ \ / /| |\/| |_____| |   | | __/ _ \ | |   | |    | |
 | |___  \ V / | |  | |_____| |___| | ||  __/ | |___| |___ | |
 |_____|  \_/  |_|  |_|     |_____|_|\__\___|  \____|_____|___|

Entered interactive mode with configuration file: [...]/.evmlc/config/config.toml
evmlc$

```

Now running `config view` or `c v`, will show you the default configuration as JSON.

```console
evmlc$ config view

[connection]
host = "127.0.0.1"
port = "8080"

[defaults]
from = ""
gas = 0.0
gasPrice = 0.0
```

To change default config values run `config set` or `c s`. You will be taken to an interactive prompt to change connection and default values.

```console
evmlc$ config set

? Host:  127.0.0.1
? Port:  8080
? Default From Address:
? Default Gas:  0
? Default Gas Price:  0
```

## Configuration Settings

The default config file path is `~/.evmlc/config.toml` with configuration:

```toml
[connection]
host = "127.0.0.1"
port = "8080"

[defaults]
from = ""
gas = 0.0
gasPrice = 0.0

[storage]
keystore = "~/.evmlc/keystore"
password = "~/.evmlc/pwd.txt"
```

## Commands
By default all commands will output raw JSON unless `-f, --formatted` flag is provided. A connection to the node is not required unless stated in each command.

The global flag `-d, --datadir` will allow you to provide a data directory path where your `keystore`, `pwd.txt` and `config.toml` will be generated if it does not exist already.
Note that if this flag is not provided for any commands run, it will take the default data directory: `~/.evmlc`

