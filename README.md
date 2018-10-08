# EVM-Lite Client (Javascript)

A Javascript client library and Command Line Interface to interact with 
EVM-Lite.

## Table of Contents

<!--ts-->
* [Table of Contents](#table-of-contents)
* [Installation](#installation)
    * [Makefile](#makefile)
* [Commands](#commands)
    * [help](#help)
    * [exit](#exit)
    * accounts
        * [create](#accounts-create)
        * [list](#accounts-list)
        * [get](#accounts-get)
    * [interactive](#interactive)
    * [globals](#globals)
    * [transfer](#transfer)
    * [config](#config)
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

## Commands

By default all commands will output raw JSON unless `-f, --formatted` flag is provided. A connection to the node is not required unless stated in each command.

### help

Lists help for the specified command:

```
help [command...]                 Provides help for a given command.
```

#### Usage

```
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

### exit

Exits interactive console.

### accounts create
***(Connection established to node)***

Creates an account encrypted with the specified password file in the specified keystore directory.

```
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

### accounts list
***(Connection established to node)***

Lists all accounts in the local keystore directory specified in the config file.

```
$ evmlc help accounts list

  Usage: accounts list [options]

  Alias: a l

  List all accounts.

  Options:

    --help           output usage information
    -f, --formatted  format output
```

### accounts get
***(Connection established to node)***

Gets an account information from the blockchain.

```
$ evmlc help accounts get

  Usage: accounts get [options] [address]

  Alias: a g

  Get an account.

  Options:

    --help             output usage information
    -f, --formatted    format output
    -i, --interactive  use interactive mode
```

### interactive

Enters into an interactive environment.

```
$ evmlc help interactive

  Usage: interactive [options]

  Alias: i

  Enter interactive mode.

  Options:

    --help  output usage information
```

### globals

Can set config variables using this command.

```
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

```
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

