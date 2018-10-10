"use strict";
/**
 * @file SolidityContract.js
 * @author Mosaic Networks <https://github.com/mosaicnetworks>
 * @date 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Web3 = require("web3");
const coder = require("web3/lib/solidity/coder.js");
const errors = require("./utils/errors");
const checks = require("./utils/checks");
const SolidityFunction_1 = require("./SolidityFunction");
const Transaction_1 = require("./Transaction");
class SolidityContract {
    /**
     * Javascript Object representation of a Solidity contract.
     *
     * Can either be used to deploy a contract or interact with a contract already deployed.
     *
     * @param {Controller} controller - Controller Javascript instance
     * @param {ContractOptions} options - The options of the contract. eg. gas price, gas, address
     * @constructor
     */
    constructor(options, controller) {
        this.options = options;
        this.controller = controller;
        const web3 = new Web3();
        this.options.address = options.address || '';
        this.web3Contract = web3.eth.contract(this.options.jsonInterface).at(this.options.address);
        this.receipt = undefined;
        this.methods = {};
        if (this.options.address !== undefined)
            this._attachMethodsToContract();
    }
    /**
     * Deploy contract to the blockchain.
     *
     * Deploys contract to the blockchain and sets the newly acquired address of the contract.
     * Also assigns the transaction receipt to this instance.
     *
     * @param {Object} options - The options for the contract. eg. constructor params, gas, gas price, data
     * @returns {SolidityContract} Returns deployed contract with receipt and address attributes
     */
    deploy(options) {
        if (this.options.address !== '')
            throw errors.ContractAddressFieldSetAndDeployed();
        this.options.jsonInterface.filter((abi) => {
            if (abi.type === "constructor" && options.parameters) {
                checks.requireArgsLength(abi.inputs.length, options.parameters.length);
            }
        });
        if (options) {
            this.options.data = options.data || this.options.data;
            this.options.gas = options.gas || this.options.gas;
            this.options.gasPrice = options.gasPrice || this.options.gasPrice;
        }
        if (this.options.data) {
            let encodedData;
            if (options.parameters)
                encodedData = this.options.data + this._encodeConstructorParams(options.parameters);
            return new Transaction_1.default({
                from: this.controller.defaultOptions.from,
                data: encodedData
            }, false, undefined, this.controller)
                .gas(this.options.gas)
                .gasPrice(this.options.gasPrice)
                .send().then((receipt) => {
                this.receipt = receipt;
                return this.setAddressAndPopulate(this.receipt.contractAddress);
            });
        }
        else {
            throw errors.InvalidDataFieldInOptions();
        }
    }
    /**
     * Sets the address of the contract and populates Solidity contract functions.
     *
     * @param {string} address - The address to assign to the contract
     * @returns {SolidityContract} The contract
     */
    setAddressAndPopulate(address) {
        this.options.address = address;
        this._attachMethodsToContract();
        return this;
    }
    /**
     * Sets the address of the contract.
     *
     * @param {string} address - The address to assign to the contract
     * @returns {SolidityContract} The contract
     */
    address(address) {
        this.options.address = address;
        return this;
    }
    /**
     * Sets the default gas for the contract.
     *
     * Any functions from the this contract will inherit the `gas` value by default.
     * You still have the option to override the value once the transaction instance is instantiated.
     *
     * @param {number} gas - The gas to assign to the contract
     * @returns {SolidityContract} The contract
     */
    gas(gas) {
        this.options.gas = gas;
        return this;
    }
    /**
     * Sets the default gas price for the contract.
     *
     * Any functions from the this contract will inherit the `gasPrice` value by default.
     * You still have the option to override the value once the transaction instance is instantiated.
     *
     * @param {number} gasPrice - The gas price to assign to the contract
     * @returns {SolidityContract} The contract
     */
    gasPrice(gasPrice) {
        this.options.gasPrice = gasPrice;
        return this;
    }
    /**
     * Sets the data for deploying the contract.
     *
     * @param {string} data - The data of the contract
     * @returns {SolidityContract} The contract
     */
    data(data) {
        this.options.data = data;
        return this;
    }
    /**
     * Sets the JSON Interface of the contract.
     *
     * @param {ABI[]} abis - The JSON Interface of contract
     * @returns {SolidityContract} The contract
     */
    JSONInterface(abis) {
        this.options.jsonInterface = abis;
        return this;
    }
    /**
     * Attaches functions to contract.
     *
     * Parses function data from ABI and creates Javascript instance representation then adds
     * these functions to Contract.methods.
     *
     * @private
     */
    _attachMethodsToContract() {
        this.options.jsonInterface.filter((json) => {
            return json.type === 'function';
        })
            .map((funcJSON) => {
            let solFunction = new SolidityFunction_1.default(funcJSON, this.options.address, this.controller);
            if (this.options.gas !== undefined && this.options.gasPrice !== undefined) {
                this.methods[funcJSON.name] = solFunction.generateTransaction.bind(solFunction, {
                    gas: this.options.gas,
                    gasPrice: this.options.gasPrice,
                });
            }
            else {
                this.methods[funcJSON.name] = solFunction.generateTransaction.bind(solFunction, {});
            }
        });
    }
    /**
     * Encodes constructor parameters.
     *
     * @param {Array} params - The parameters to encode
     * @private
     */
    _encodeConstructorParams(params) {
        return this.options.jsonInterface.filter((json) => {
            return json.type === 'constructor' && json.inputs.length === params.length;
        })
            .map((json) => {
            return json.inputs.map((input) => {
                return input.type;
            });
        })
            .map((types) => {
            return coder.encodeParams(types, params);
        })[0] || '';
    }
}
exports.default = SolidityContract;
