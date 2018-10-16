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

The global flag `-d, --datadir` specifies the directory where `keystore`, 
`pwd.txt` and `config.toml` are stored unless overwritten by specific flags. 
Note that if this flag is not provided, it will default to `~/.evmlc`.

## Getting Started

We explain how to use `evmlc` against a single `evm-lite` node. We will walk 
through creating accounts, making transfers, and viewing account information. 

### 1) Run `evmlc` in interactive mode

```bash
user:~$ evmlc i
Entered interactive mode with data directory: /home/user/.evmlc
evmlc$ 
```

### 2) Create an account

While still in interactive mode, type the command `accounts create` and select
the default options in the prompt:

```bash
evmlc$ accounts create
? Enter keystore output path:  /home/user/.evmlc/keystore
? Enter password file path:  /home/user/.evmlc/pwd.txt
{"version":3,"id":"f62fe161-0870-4553-9cf2-3155b19d4b59","address":"477f22b53038b745bb039653b91bdaa88c8bf94d","crypto":{"ciphertext":"XXX","cipherparams":{"iv":"26807046432c098a51a563393dcd91fa"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"XXX","n":8192,"r":8,"p":1},"mac":"XXX"}}
evmlc$ 
```

#### What happened?

It created an account with address `477f22b53038b745bb039653b91bdaa88c8bf94d`, 
and added the corresponding keyfile, password protected with the password file, 
in the keystore directory

#### What is an account?

EVM-Lite uses the same account model as Ethereum. Accounts represent identities 
of external agents, and are associated with a balance (and storage for Contract 
accounts). They rely on public key cryptography to sign transactions so that the 
EVM can securely validate the identity of a transaction sender.

Using the same account model as Ethereum doesn't mean that existing Ethereum 
accounts automatically have the same balance in EVM-Lite (or vice versa). In 
Ethereum, balances are denoted in Ether, the cryptocurrency maintained by the 
public Ethereum network. On the other hand, every EVM-Lite network (even a 
single node network) maintains a completely separate ledger, and may use any 
name for the corresponding coin. 

Accounts are objects in the EVM-Lite State. They come in two types: Externally 
owned accounts, and Contract accounts. Externally owned accounts have a balance, 
and Contract accounts have a balance and storage. The EVM-Lite State is the 
state of all accounts which is updated with every transaction. The underlying 
consensus engine ensures that every participant in an EVM-Lite network processes 
the same transactions in the same order, thereby arriving at the same State.

Restricting EVM-Lite to externally owned accounts makes for an “altcoin” system 
that can only be used to transfer coins. The use of Contract accounts with the 
EVM make it possible to deploy and use *Smart Contracts* which we will explore 
in another document.

#### What is an account file?

This is best explained in the 
[Ethereum Docs](http://ethdocs.org/en/latest/account-management.html):

>Every account is defined by a pair of keys, a private key and public key. 
>Accounts are indexed by their address which is derived from the public key by 
>taking the last 20 bytes. Every private key/address pair is encoded in a 
>keyfile. Keyfiles are JSON text files which you can open and view in any text 
>editor. The critical component of the keyfile, your account’s private key, is 
>always encrypted, and it is encrypted with the password you enter when you 
>create the account. 

### 3) Start an `evm-lite` node and pre-allocate funds to our address

If you haven't done so yet, please install and familiarize yourself with 
[EVM-Lite](https://github.com/mosaicnetworks/evm-lite), our lightweight Ethereum
node with interchangeable consensus.

In a separate terminal from the interactive `evmlc` session, start a single node 
(in Solo mode) and specify the previously created account address as the genesis 
account:

```bash
user:~$ evml solo --genesis 477f22b53038b745bb039653b91bdaa88c8bf94d
DEBU[0000] Config                                        Base="{/home/user/.evm-lite debug}" Eth="&{/home/user/.evm-lite/eth/genesis.json /home/user/.evm-lite/eth/keystore /home/user/.evm-lite/eth/pwd.txt /home/user/.evm-lite/eth/chaindata :8080 128}"
DEBU[0000] Config                                        Eth="&{/home/user/.evm-lite/eth/genesis.json /home/user/.evm-lite/eth/keystore /home/user/.evm-lite/eth/pwd.txt /home/user/.evm-lite/eth/chaindata :8080 128}" genesis=477f22b53038b745bb039653b91bdaa88c8bf94d
DEBU[0000] Writing genesis file                         
DEBU[0000] INIT                                          module=solo
DEBU[0000] Adding account                                address=477f22b53038b745bb039653b91bdaa88c8bf94d
DEBU[0000] Committed                                     root=0x1aa38473e2f6fc5ada1bb0e6eeddc1fdeda991ff7a50150e16306e018d9a7639
DEBU[0000] Reset WAS                                    
DEBU[0000] Reset TxPool                                 
INFO[0000] serving api...                               

```

This booted the node and assigned a lot of coins to our account. By default,
`evm-lite` is configured to listen on any interface on port 8080 (:8080), and 
`evmlc` is configured to connect to `localhost:8080`, so the client and node are
ready to talk. 

How many coins where assigned to the account? let's check!

### 4) List accounts

Back in the interactive `evmlc` session, type `accounts list -f`

```bash
evmlc$ accounts list -f
.----------------------------------------------------------------------------------------.
| # |                  Address                   |            Balance            | Nonce |
|---|--------------------------------------------|-------------------------------|-------|
| 1 | 0x477F22b53038b745BB039653b91bdaA88c8bF94d | 1,337,000,000,000,000,000,000 |     0 |
'----------------------------------------------------------------------------------------'
evmlc$ 
```

The command went through the accounts in the keystore, connected to the node to 
retrieve the corresponding balance, and displayed it nicely on the screen.


### 5) Create another account

```bash
evmlc$ accounts create
? Enter keystore output path:  /home/user/.evmlc/keystore
? Enter password file path:  /home/user/.evmlc/pwd.txt
{"version":3,"id":"1cd4f6fc-5d66-49b9-b3b2-f0ba0798450c","address":"988456018729c15a6914a2c5ba1a753f76ec36dc","crypto":{"ciphertext":"XXX","cipherparams":{"iv":"421d86663e8cd0915ab0bbedb0e14d96"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"XXX","n":8192,"r":8,"p":1},"mac":"XXX"}}
evmlc$ 
```

This one has the address `988456018729c15a6914a2c5ba1a753f76ec36dc`

### 6) Transfer coins from one account to another

Type `transfer` and follow the instructions to transfer coins from the first 
account to the second account.

```bash
evmlc$ transfer
? From:  0x477F22b53038b745BB039653b91bdaA88c8bF94d
? To 988456018729c15a6914a2c5ba1a753f76ec36dc
? Value:  100
? Gas:  25000
? Gas Price:  0
{"txHash":"0xa64b35b2228f00d9b5ba01fcd4c8bcd1c89b33d8b5fd917ea2c4d4de2a7d43ea"}
Transaction submitted.
evmlc$ 
```

#### What happened?

It **created a transaction** to send 100 coins from the first account to the 
second account, **signed it** with the sender's private key, and **sent it** to 
the evm-lite node. The node responded with the transaction hash, which 
identifies our transaction in EVM-Lite, and allows us to query its results.

#### What is a transaction?

A transaction is a signed data package that contains instructions for the EVM.
It can contain instructions to move coins from one account to another, create a 
new Contract account, or call an existing Contract account. Transactions are 
encoded using the custom Ethereum scheme, RLP, and contain the following fields:

- the recipient of the message,
- a signature identifying the sender and proving their intention to send the 
transaction. 
- The number of coin to transfer from the sender to the recipient,
- an optional data field, which can contain the message sent to a contract,
- a STARTGAS value, representing the maximum number of computational steps the 
transaction execution is allowed to take,
- a GASPRICE value, representing the fee the sender is willing to pay for gas. 
One unit of gas corresponds to the execution of one atomic instruction, i.e., a 
computational step.  

### 7) Check accounts again

```bash
evmlc$ accounts list -f
.----------------------------------------------------------------------------------------.
| # |                  Address                   |            Balance            | Nonce |
|---|--------------------------------------------|-------------------------------|-------|
| 1 | 0x477F22b53038b745BB039653b91bdaA88c8bF94d | 1,336,999,999,999,999,999,900 |     1 |
| 2 | 0x988456018729C15A6914A2c5bA1A753F76eC36Dc |                           100 |     0 |
'----------------------------------------------------------------------------------------'
evmlc$ 
```

### Conclusion

We showed how to use `evmlc` to create an EVM-Lite account and transfer coins 
from one account to another. We used a single EVM-Lite node, running in Solo 
mode, for the purpose of demonstration, but the same concepts apply with 
networks consisting of multiple nodes, powered by other consensus algorithms 
(like Babble or Raft). In another document, we will describe how to create,
publish, and interact with SmartContracts.

Many more features to come...