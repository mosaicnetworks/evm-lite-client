# EVM-Lite Client (Javascript)

A Javascript client library and Command Line Interface to interact with 
EVM-Lite.

## Installation

To begin with, you will need to install Node and NPM, which are bundled together 
in the installation package from the [Node website](https://nodejs.org/en/).

This project was built with Node version 10.10.0 and NPM version 6.1.0.

### Makefile

To download Javascript dependencies and install `evmlc`, run:

```
$ make
```

To clean all of the steps from the `make` command run:

```
$ make clean
```

This removes all dependencies for Client and CLI and also removes the symlink.

If the `make` was successful you should now be able to run `evmlc`:

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

## Configuration

The first time it runs, and if no options are specified, `evmlc` creates a 
special directory in a default location (`~/.evmlc` on Linux and Mac), where it 
stores any relevant information. In particular, this directory contains the 
following items:

 - **config.toml**: where global options are specified. These values may be 
                    overwritten by CLI flags.
 - **keystore**: where all encrypted account keys are stored.
 - **pwd.txt**: password file to decrypt keys. 

Example config.toml:
 ```toml
[connection]
host = "127.0.0.1"
port = "8080"

[defaults]
from = ""
gas = 100000.0
gasPrice = 0.0

[storage]
keystore = "/home/user/.evmlc/keystore"
password = "/home/user/.evmlc/pwd.txt"
 ```

The easiest way to manage configuration is through the `config` command in 
interactive mode.  

```console
$ evmlc i
Entered interactive mode with configuration file: [...]/.evmlc/config.toml
evmlc$

```
To change default configuration values run `config set` or `c s`. You will be 
taken to an interactive prompt to change connection and default values.

```console
evmlc$ config set

? Host:  127.0.0.1
? Port:  8080
? Default From Address:
? Default Gas:  0
? Default Gas Price:  0
```

## Commands
By default all commands will output raw JSON unless the `-f, --formatted` flag 
is provided. A connection to the node is not required unless stated in each 
command.

The global flag `-d, --datadir` will allow you to provide a data directory path 
where your `keystore`, `pwd.txt` and `config.toml` will be generated if it does 
not exist already. Note that if this flag is not provided for any commands run, 
it will take the default data directory: `~/.evmlc`

## Getting Started

cf [Getting Started](docs/getting-started.md)