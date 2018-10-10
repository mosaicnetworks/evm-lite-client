"use strict";
/**
 * @file SolidityFunction.js
 * @author Mosaic Networks <https://github.com/mosaicnetworks>
 * @date 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
const SolFunction = require("web3/lib/web3/function.js");
const coder = require("web3/lib/solidity/coder.js");
const checks = require("./utils/checks");
const Transaction_1 = require("./Transaction");
class SolidityFunction {
    /**
     * Javascript Object representation of a Solidity function.
     *
     * @param {ABI} abi - JSON describing the function details
     * @param {string} contractAddress - The address of parent contract
     * @param {Controller} controller - The controller class
     * @constructor
     */
    constructor(abi, contractAddress, controller) {
        this.contractAddress = contractAddress;
        this.controller = controller;
        this.name = abi.name;
        this._solFunction = new SolFunction('', abi, '');
        this._constant = (abi.stateMutability === "view" || abi.stateMutability === "pure" || abi.constant);
        this._payable = (abi.stateMutability === "payable" || abi.payable);
        this._inputTypes = abi.inputs.map((i) => {
            return i.type;
        });
        this._outputTypes = abi.outputs.map((i) => {
            return i.type;
        });
    }
    /**
     * Generates Transaction instance to be sent or called.
     *
     * Creates the scaffolding needed for the transaction to be executed.
     *
     * @param {Object} options - The options for the transaction of this function
     * @param {Array} funcArgs - A list containing all the parameters of the function
     */
    generateTransaction(options, ...funcArgs) {
        this._validateArgs(funcArgs);
        let callData = this._solFunction.getData();
        let tx = {
            from: this.controller.defaultOptions.from,
            to: this.contractAddress,
        };
        if (options && options.gas !== undefined && options.gasPrice !== undefined) {
            tx.gas = options.gas;
            tx.gasPrice = options.gasPrice;
        }
        tx.data = callData;
        if (tx.value <= 0 && this._payable)
            throw Error('Function is payable and requires `value` greater than 0.');
        else if (tx.value > 0 && !this._payable)
            throw Error('Function is not payable. Required `value` is 0.');
        let unpackfn = undefined;
        if (this._constant)
            unpackfn = this.unpackOutput.bind(this);
        return new Transaction_1.default(tx, this._constant, unpackfn, this.controller);
    }
    /**
     * Decodes output with the corresponding return types.
     *
     * @param {string} output - The output string to decode
     */
    unpackOutput(output) {
        output = output.length >= 2 ? output.slice(2) : output;
        let result = coder.decodeParams(this._outputTypes, output);
        return result.length === 1 ? result[0] : result;
    }
    /**
     * Validates arguments to the function.
     *
     * This checks types as well as length of input arguments to required.
     *
     * @param {Array} args - The list of arguments for the function
     * @private
     */
    _validateArgs(args) {
        checks.requireArgsLength(this._inputTypes.length, args.length);
        args.map((a, i) => {
            checks.requireSolidityTypes(this._inputTypes[i], a);
        });
    }
}
exports.default = SolidityFunction;
