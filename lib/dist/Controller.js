"use strict";
/**
 * @file Controller.js
 * @author Mosaic Networks <https://github.com/mosaicnetworks>
 * @date 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
const JSONBig = require("json-bigint");
const fs = require("fs");
const solidityCompiler = require("solc");
const SolidityContract_1 = require("./evm/SolidityContract");
const Client_1 = require("./evm/Client");
const Transaction_1 = require("./evm/Transaction");
/**
 * The root class to interactive with EVM-Lite.
 */
class Controller {
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
    constructor(host, port = 8080, _defaultTXOptions = {}) {
        this.host = host;
        this.port = port;
        this._defaultTXOptions = _defaultTXOptions;
        this.accounts = [];
        this.api = new Client_1.default(host, port);
    }
    /**
     * Return default options
     *
     * @returns {DefaultTXOptions} A Javascript instance with default transaction parameters
     */
    get defaultOptions() {
        return this._defaultTXOptions;
    }
    /**
     * Get default `from` address
     *
     * @returns {string} The default `from` address
     */
    get defaultFrom() {
        return this._defaultTXOptions.from;
    }
    /**
     * Set default `from` address
     *
     * @param {string} address - The address to set default `from` value
     */
    set defaultFrom(address) {
        this._defaultTXOptions.from = address;
    }
    /**
     * Get default `gas` value
     *
     * @returns {number} The default `gas` value
     */
    get defaultGas() {
        return this._defaultTXOptions.gas;
    }
    /**
     * Set default `gas` value
     *
     * @param {number} gas - The gas value to set as default
     */
    set defaultGas(gas) {
        this._defaultTXOptions.gas = gas;
    }
    /**
     * Get default `gasPrice` value
     *
     * @returns {number} The default `gasPrice` value
     */
    get defaultGasPrice() {
        return this._defaultTXOptions.gasPrice;
    }
    /**
     * Set default `from` address
     *
     * @param {number} gasPrice - The gasPrice value to set as default
     */
    set defaultGasPrice(gasPrice) {
        this._defaultTXOptions.gasPrice = gasPrice;
    }
    /**
     * Generates Javascript instance from Solidity Contract File.
     *
     * Takes a solidity file and generates corresponding functions associated with the contract
     * name provided. The byte-code of the contract is auto-assigned to the data option field
     * for contract deployment.
     *
     * @param {string} contractName - Name of the Contract to get from Solidity file
     * @param {string} filePath - Absolute or relative path of the Solidity file.
     * @returns {SolidityContract} A Javascript instance representation of solidity contract
     */
    ContractFromSolidityFile(contractName, filePath) {
        this._requireDefaultFromAddress();
        let input = fs.readFileSync(filePath).toString();
        let output = solidityCompiler.compile(input, 1);
        let byteCode = output.contracts[`:${contractName}`].bytecode;
        let abi = JSONBig.parse(output.contracts[`:${contractName}`].interface);
        return new SolidityContract_1.default({
            jsonInterface: abi,
            data: byteCode,
            gas: this._defaultTXOptions.gas || undefined,
            gasPrice: this._defaultTXOptions.gasPrice || undefined
        }, this);
    }
    ;
    /**
     * Generates Contract Javascript instance from Solidity Contract File.
     *
     * Takes ABI and generates corresponding functions associated with the contract provided.
     * The byte-code of the contract needs to be assigned before deploying. Mostly used to
     * interact with already deployed contracts.
     *
     * @param {ABI[]} abi - The Application Binary Interface of the Solidity contract
     * @returns {SolidityContract} A Javascript instance representation of solidity contract
     */
    ContractFromABI(abi) {
        this._requireDefaultFromAddress();
        return new SolidityContract_1.default({
            jsonInterface: abi,
            gas: this._defaultTXOptions.gas || undefined,
            gasPrice: this._defaultTXOptions.gasPrice || undefined
        }, this);
    }
    /**
     * Transfer a specified value to the desired address.
     *
     * Sender address can be set after instantiating the Controller instance (recommended) or
     * after the Transaction instance has been created.
     *
     * @param {string} to - The address of the sender
     * @param {string} from - The address of the receiver
     * @param {number} value - The value to send the receiver
     * @returns {Transaction} the required Transaction instance for transfer request
     */
    transfer(to, from, value) {
        if (from === '') {
            from = this.defaultOptions.from;
        }
        return new Transaction_1.default({
            from: from,
            to: to,
            value: value,
            gas: this._defaultTXOptions.gas || undefined,
            gasPrice: this._defaultTXOptions.gasPrice || undefined
        }, false, undefined, this);
    }
    /**
     * Require default from address to be set.
     *
     * @private
     */
    _requireDefaultFromAddress() {
        if (this._defaultTXOptions.from == null) {
            throw new Error('Set default `from` address. use `EVML.defaultFrom(<address>)`');
        }
    }
    ;
}
exports.default = Controller;
