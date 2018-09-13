import * as Web3 from 'web3'
import * as coder from 'web3/lib/solidity/coder.js'

import * as errors from "../misc/errors"
import * as utils from "../misc/utils";
import * as checks from '../misc/checks';

import {ABI, ContractOptions, TXReceipt} from "../misc/Interfaces";

import SolidityFunction from "./SolidityFunction";
import Controller from "../Controller";
import Transaction from "./Transaction";


export default class SolidityContract {

    public methods: any;
    public web3Contract: any;
    public receipt: TXReceipt;

    /**
     * Javascript Object representation of a Solidity contract.
     *
     * Can either be used to deploy a contract or interact with a contract already deployed.
     *
     * @param {Controller} controller Controller Javascript object
     * @param {ContractOptions} options The options of the contract. eg. gas price, gas, address
     * @constructor
     */
    constructor(public options: ContractOptions, readonly controller: Controller) {
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
    deploy(options?: { parameters?: any[], gas?: number, gasPrice?: any, data?: string }) {
        if (this.options.address !== '')
            throw errors.ContractAddressFieldSetAndDeployed();

        this.options.jsonInterface.filter((abi: ABI) => {
            if (abi.type === "constructor") {
                if (options.parameters)
                    checks.requireArgsLength(abi.inputs.length, options.parameters.length);
            }
        });

        if (options) {
            this.options.data = options.data || this.options.data;
            this.options.gas = options.gas || this.options.gas;
            this.options.gasPrice = options.gasPrice || this.options.gasPrice;
        }

        if (this.options.data) {
            let encodedData: string;

            if (options.parameters)
                encodedData = this.options.data + this._encodeConstructorParams(options.parameters);

            return new Transaction({
                from: this.controller.defaultAddress,
                data: encodedData
            }, this.controller)
                .gas(this.options.gas)
                .gasPrice(this.options.gas)
                .send()
                .then((receipt: TXReceipt) => {
                    this.receipt = receipt;
                    return this.address(this.receipt.contractAddress);
                })
        } else {
            throw errors.InvalidDataFieldInOptions();
        }
    }

    /**
     * Sets the address of the contract and populates Solidity functions.
     *
     * @param {string} address The address to assign to the contract
     * @returns {SolidityContract} The contract
     */
    address(address: string): SolidityContract {
        this.options.address = address;
        this._attachMethodsToContract();
        return this
    }

    /**
     * Sets the gas of the contract.
     *
     * @param {number} gas The gas to assign to the contract
     * @returns {SolidityContract} The contract
     */
    gas(gas: number): SolidityContract {
        this.options.gas = gas;
        return this
    }

    /**
     * Sets the gas price for deploying the contract.
     *
     * @param {number} gasPrice The gas price to assign to the contract
     * @returns {SolidityContract} The contract
     */
    gasPrice(gasPrice: number): SolidityContract {
        this.options.gasPrice = gasPrice;
        return this
    }

    /**
     * Sets the data for deploying the contract.
     *
     * @param {string} data The data of the contract
     * @returns {SolidityContract} The contract
     */
    data(data: string): SolidityContract {
        this.options.data = data;
        return this
    }

    /**
     * Sets the JSON Interface of the contract.
     *
     * @param {ABI[]} abis The JSON Interface of contract
     * @returns {SolidityContract} The contract
     */
    JSONInterface(abis: ABI[]): SolidityContract {
        this.options.jsonInterface = abis;
        return this
    }

    /**
     * Attaches functions to contract.
     *
     * Parses function data from ABI and creates Javascript object representation then adds
     * these functions to Contract.methods.
     *
     * @private
     */
    private _attachMethodsToContract(): void {
        this.options.jsonInterface.filter((json) => {
            return json.type === 'function';
        })
            .map((funcJSON: ABI) => {
                let solFunction = new SolidityFunction(funcJSON, this.options.address, this.controller);
                this.methods[funcJSON.name] = solFunction.generateTransaction.bind(solFunction);
                utils.log(utils.fgBlue, `Adding function: ${funcJSON.name}()`);
            })
    }

    /**
     * Encodes constructor parameters.
     *
     * @param {Array} params The parameters to encode
     * @private
     */
    private _encodeConstructorParams(params: any[]): any {
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