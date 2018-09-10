"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Web3 = require("web3");
const coder = require("web3/lib/solidity/coder.js");
const errors = require("../misc/errors");
const utils = require("../misc/utils");
const checks = require("../misc/checks");
const SolidityFunction_1 = require("./SolidityFunction");
const Transaction_1 = require("./Transaction");
const web3 = new Web3();
class SolidityContract {
    constructor(monetNode, options) {
        this.monetNode = monetNode;
        this.options = options;
        if (options.address === undefined)
            this.options.address = '';
        this.web3Contract = web3.eth.contract(this.options.jsonInterface).at(this.options.address);
        this.receipt = undefined;
        this.methods = {};
        if (this.options.address !== undefined)
            this._attachMethodsToContract();
    }
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
                from: this.monetNode.defaultAddress,
                data: encodedData
            }, this.monetNode)
                .send({
                gas: options.gas,
                gasPrice: options.gasPrice
            })
                .then((receipt) => {
                this.receipt = receipt;
                this.at(this.receipt.contractAddress);
                return this;
            });
        }
        else {
            throw errors.InvalidDataFieldInOptions();
        }
    }
    clone() {
        return this;
    }
    at(value) {
        this.options.address = value;
        this._attachMethodsToContract();
    }
    _attachMethodsToContract() {
        this.options.jsonInterface.filter((json) => {
            return json.type == 'function';
        })
            .map((funcJSON) => {
            let solFunction = new SolidityFunction_1.default(funcJSON, this.options.address, this.monetNode);
            this.methods[funcJSON.name] = solFunction.generateTransaction.bind(solFunction);
            utils.log(utils.fgBlue, `Adding function: ${funcJSON.name}()`);
        });
    }
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
