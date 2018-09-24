import * as JSONBig from 'json-bigint'
import * as fs from "fs";
import * as solidityCompiler from 'solc'

import {ABI, Account, BaseTX, SolidityCompilerOutput} from "./evm/utils/Interfaces";

import SolidityContract from "./evm/SolidityContract";
import EVMLiteClient from "./evm/EVMLiteClient";
import Transaction from "./evm/Transaction";


interface DefaultTXOptions extends BaseTX {
    from?: string,
}

export default class Controller {

    public accounts: Account[];
    readonly api: EVMLiteClient;

    /**
     * Creates a controller instance.
     *
     * This class controls all of functionality for interacting with an EVM-Lite node.
     *
     * @param {string} host - The IP or alias of the EVM-Lite node
     * @param {number} port - Port to access the service. default = 8080
     * @param {DefaultTXOptions} _defaultTXOptions - Default transaction options
     * @constructor
     */
    constructor(readonly host: string, readonly port: number = 8080, private _defaultTXOptions: DefaultTXOptions = {}) {
        this.accounts = [];
        this.api = new EVMLiteClient(host, port);
    }

    /**
     * Return default options
     *
     * @returns {DefaultTXOptions} A Javascript object with default transaction parameters
     */
    get defaultOptions(): DefaultTXOptions {
        return this._defaultTXOptions;
    }

    /**
     * Get default `from` address
     *
     * @returns {string} The default `from` address
     */
    get defaultFrom(): string {
        return this._defaultTXOptions.from;
    }

    /**
     * Set default `from` address
     *
     * @param {string} address - The address to set default `from` value
     */
    set defaultFrom(address: string) {
        this._defaultTXOptions.from = address;
    }

    /**
     * Get default `gas` value
     *
     * @returns {number} The default `gas` value
     */
    get defaultGas(): number {
        return this._defaultTXOptions.gas;
    }

    /**
     * Set default `gas` value
     *
     * @param {number} gas - The gas value to set as default
     */
    set defaultGas(gas: number) {
        this._defaultTXOptions.gas = gas;
    }

    /**
     * Get default `gasPrice` value
     *
     * @returns {number} The default `gasPrice` value
     */
    get defaultGasPrice(): number {
        return this._defaultTXOptions.gasPrice;
    }

    /**
     * Set default `from` address
     *
     * @param {number} gasPrice - The gasPrice value to set as default
     */
    set defaultGasPrice(gasPrice: number) {
        this._defaultTXOptions.gasPrice = gasPrice;
    }

    /**
     * Generates Javascript object from Solidity Contract File.
     *
     * Takes a solidity file and generates corresponding functions associated with the contract
     * name provided. The byte-code of the contract is auto-assigned to the data option field
     * for contract deployment.
     *
     * @param {string} contractName - Name of the Contract to get from Solidity file
     * @param {string} filePath - Absolute or relative path of the Solidity file.
     * @returns {SolidityContract} A Javascript object representation of solidity contract
     */
    ContractFromSolidityFile(contractName: string, filePath: string): SolidityContract {
        this._requireDefaultFromAddress();

        let input = fs.readFileSync(filePath).toString();
        let output: SolidityCompilerOutput = solidityCompiler.compile(input, 1);
        let byteCode = output.contracts[`:${contractName}`].bytecode;
        let abi = JSONBig.parse(output.contracts[`:${contractName}`].interface);

        return new SolidityContract({
            jsonInterface: abi,
            data: byteCode,
            gas: this._defaultTXOptions.gas || undefined,
            gasPrice: this._defaultTXOptions.gasPrice || undefined
        }, this)
    };

    /**
     * Generates Contract Javascript object from Solidity Contract File.
     *
     * Takes ABI and generates corresponding functions associated with the contract provided.
     * The byte-code of the contract needs to be assigned before deploying. Mostly used to
     * interact with already deployed contracts.
     *
     * @param {ABI[]} abi - The Application Binary Interface of the Solidity contract
     * @returns {SolidityContract} A Javascript object representation of solidity contract
     */
    ContractFromABI(abi: ABI[]): SolidityContract {
        this._requireDefaultFromAddress();

        return new SolidityContract({
            jsonInterface: abi,
            gas: this._defaultTXOptions.gas || undefined,
            gasPrice: this._defaultTXOptions.gasPrice || undefined
        }, this);
    }

    /**
     * Transfer a specified value to the desired address.
     *
     * Sender address can be set after instantiating the Controller object (recommended) or
     * after the Transaction object has been created.
     *
     * @param {string} address - The address of the receiver
     * @param {number} value - The value to send the receiver
     * @returns {Transaction} the required Transaction object for transfer request
     */
    transfer(address: string, value: number): Transaction {
        this._requireDefaultFromAddress();

        return new Transaction({
            from: this._defaultTXOptions.from,
            to: address,
            value: value,
            gas: this._defaultTXOptions.gas || undefined,
            gasPrice: this._defaultTXOptions.gasPrice || undefined
        }, false, undefined, this)
    }

    /**
     * Require default from address to be set.
     *
     * @private
     */
    private _requireDefaultFromAddress(): void {
        if (this._defaultTXOptions.from == null) {
            throw new Error('Set default `from` address. use `EVML.defaultFrom(<address>)`');
        }
    };

}