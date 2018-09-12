"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Web3 = require("web3");
const coder = require("web3/lib/solidity/coder.js");
const errors = require("../misc/errors");
const utils = require("../misc/utils");
const checks = require("../misc/checks");
const SolidityFunction_1 = require("./SolidityFunction");
const Transaction_1 = require("./Transaction");
class SolidityContract {
    /**
     * Javascript Object representation of a Solidity contract.
     *
     * Can either be used to deploy a contract or interact with a contract already deployed.
     *
     * @param {Controller} controller Controller Javascript object
     * @param {ContractOptions} options The options of the contract. eg. gas price, gas, address
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
     * Deploys contract to the blockchain and sets the newly acquired address of the new contract.
     * Also assigns the transaction receipt to this.
     *
     * @param {Object} options The options for the contract. eg. constructor params, gas, gas price, data
     * @returns {SolidityContract} Returns deployed contract with receipt and address attributes
     */
    deploy(options) {
        if (this.options.address !== '')
            throw errors.ContractAddressFieldSetAndDeployed();
        this.options.jsonInterface.filter((abi) => {
            if (abi.type === "constructor") {
                if (options.parameters)
                    checks.requireArgsLength(abi.inputs.length, options.parameters.length);
            }
        });
        if (options.data)
            this.options.data = options.data;
        if (this.options.data) {
            let encodedData;
            if (options.parameters)
                encodedData = this.options.data + this._encodeConstructorParams(options.parameters);
            return new Transaction_1.default({
                from: this.controller.defaultAddress,
                data: encodedData
            }, this.controller)
                .send({
                    gas: options.gas,
                    gasPrice: options.gasPrice
                })
                .then((receipt) => {
                    this.receipt = receipt;
                    return this.address(this.receipt.contractAddress);
                });
        }
        else {
            throw errors.InvalidDataFieldInOptions();
        }
    }
    /**
     * Sets the address of the contract and populates Solidity functions.
     *
     * @param {string} address The address to assign to the contract
     * @returns {SolidityContract} The contract
     */
    address(address) {
        this.options.address = address;
        this._attachMethodsToContract();
        return this;
    }

    /**
     * Sets the gas of the contract.
     *
     * @param {number} gas The gas to assign to the contract
     * @returns {SolidityContract} The contract
     */
    gas(gas) {
        this.options.gas = gas;
        return this;
    }

    /**
     * Sets the gas price for deploying the contract.
     *
     * @param {number} gasPrice The gas price to assign to the contract
     * @returns {SolidityContract} The contract
     */
    gasPrice(gasPrice) {
        this.options.gasPrice = gasPrice;
        return this;
    }

    /**
     * Sets the data for deploying the contract.
     *
     * @param {string} data The gas to assign to the contract
     * @returns {SolidityContract} The contract
     */
    data(data) {
        this.options.data = data;
        return this;
    }

    /**
     * Sets the JSON Interface of the contract.
     *
     * @param {ABI[]} abis The JSON Interface of contract
     * @returns {SolidityContract} The contract
     */
    JSONInterface(abis) {
        this.options.jsonInterface = abis;
        return this;
    }
    /**
     * Attaches functions to contract.
     *
     * Parses function data from ABI and creates Javascript object representation then adds
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
                this.methods[funcJSON.name] = solFunction.generateTransaction.bind(solFunction);
                utils.log(utils.fgBlue, `Adding function: ${funcJSON.name}()`);
            });
    }
    /**
     * Encodes constructor parameters.
     *
     * @param {Array} params The parameters to encode
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
