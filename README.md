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
* [Configuration Settings](#configuration-settings)
* [Commands](#commands)
    * [help](#help)
    * accounts
        * [create](#accounts-create)
        * [list](#accounts-list)
        * [get](#accounts-get)
    * [interactive](#interactive)
    * [globals](#globals)
    * [transfer](#transfer)
    * [config](#config)
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

  Commands:

    help [command...]                 Provides help for a given command.
    exit                              Exits application.
    accounts create [options]         Create an account.
    accounts list [options]           List all accounts.
    accounts get [options] [address]  Get an account.
    interactive                       Enter interactive mode.
    globals [options]                 Set default global values.
    transfer [options]                Transfer token(s) to address.
    config                            Show config JSON.

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

## Configuration Settings

The default config directory is `~/.evmlc/config` with configuration:

```toml
title = "EVM-Lite CLI Config"

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

### help

Lists help for the specified command:

```
help [command...]                 Provides help for a given command.
```

#### Usage

```console
$ evmlc help transfer

  Usage: transfer [options]

  Alias: t

  Transfer token(s) to address.

  Options:

    --help                   output usage information
    -i, --interactive        value to send
    -v, --value <value>      value to send
    -g, --gas <value>        gas to send at
    -gp, --gasprice <value>  gas price to send at
    -t, --to <address>       address to send to
    -f, --from <address>     address to send from
```

### accounts create
***(Connection established to node)***

Creates an account encrypted with the specified password file in the specified keystore directory.

```
accounts create [options]         Create an account.
```

#### Usage

```console
$ evmlc help accounts create

  Usage: accounts create [options]

  Alias: a c

  Create an account.

  Options:

    --help                 output usage information
    -o, --output <path>    provide output path
    -p, --password <path>  provide password file path
    -i, --interactive      use interactive mode
```
If no `-p, --password` or `-o, --output` are specified, the defaults from the config will be used.


#### Example

```console
$ evmlc accounts create

{"version":3,"id":"a43633f8-ff09-40fd-a1b1-0df40f49f191","address":"e5569229f939e3c8952dcbb964458a91a2370386","crypto":{"ciphertext":"4be03becfcafe020bf2f376d630e0e5f1c163754cdf03f998f1c331a3fa44d9c","cipherparams":{"iv":"7dc4dcb5e9337607b16b65604350e056"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"57ace5f8038269dee49b2474123be13bcda68c29652754b5e04602d34459687a","n":8192,"r":8,"p":1},"mac":"671be8a335d705c32953d970f647126a80e56e37d5453457b171a65aa853f886"}}
```
Here the default keystore was `~/.evmlc/keystore` and default password file was `~/.evmlc/pwd.txt`.

### accounts list
***(Connection established to node)***

Lists all accounts in the local keystore directory specified in the config file. This command will also
get balance and nonce from the node.

```console
accounts list [options]           List all accounts.
```

#### Usage

The `-f, --formatted` flag will output the accounts in an ASCII table.

```console
$ evmlc help accounts list

  Usage: accounts list [options]

  Alias: a l

  List all accounts.

  Options:

    --help           output usage information
    -f, --formatted  format output
```

#### Example

```console
$ evmlc accounts list
[{"address":"0xAcd21941401273bD112250081F0743dEB884EBA3","balance":0,"nonce":0},{"address":"0xe5569229F939e3c8952DCBb964458a91A2370386","balance":0,"nonce":0}]
```

### accounts get
***(Connection established to node)***

Gets an account information from the blockchain.

```console
accounts get [options] [address]  Get an account.
```

#### Usage

The `-f, --formatted` flag will output the accounts in an ASCII table.

```console
$ evmlc help accounts get

  Usage: accounts get [options] [address]

  Alias: a g

  Get an account.

  Options:

    --help             output usage information
    -f, --formatted    format output
    -i, --interactive  use interactive mode
```

#### Example

```console
$ evmlc accounts get 0xf6a277339cd2172d90535f40cf206613bbce05c7
{"address":"0xF6A277339cd2172D90535F40cf206613bBCe05c7","balance":1337000000000000000000,"nonce":0}
```

### interactive

Enters into an interactive environment.

```console
$ evmlc help interactive

  Usage: interactive [options]

  Alias: i

  Enter interactive mode.

  Options:

    --help  output usage information
```

### globals

Can set config variables using this command.

```console
$ evmlc help globals

  Usage: globals [options]

  Alias: g

  Set default global values.

  Options:

    --help                 output usage information
    -i, --interactive      enter into interactive command
    -h, --host <host>      default host
    -p, --port <port>      default port
    --from <from>          default from
    --gas <gas>            default gas
    --gasprice <gasprice>  gas price
    --keystore <path>      keystore path
    --pwd <path>           password path
```

### transfer
***(Connection established to node)***

Transfer tokens to address.

```console
$ evmlc help transfer

  Usage: transfer [options]

  Alias: t

  Transfer token(s) to address.

  Options:

    --help                   output usage information
    -i, --interactive        value to send
    -v, --value <value>      value to send
    -g, --gas <value>        gas to send at
    -gp, --gasprice <value>  gas price to send at
    -t, --to <address>       address to send to
    -f, --from <address>     address to send from
```


### config

Outputs current configuration as JSON.

### exit

Exits interactive console.


