"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SolFunction = require("web3/lib/web3/function.js");
const checks = require("../misc/checks");
const Transaction_1 = require("./Transaction");
class SolidityFunction {
    /**
     * Javascript Object representation of a Solidity function.
     *
     * @param {ABI} abi JSON describing the function details
     * @param {string} contractAddress The address of parent contract
     * @param {Controller} controller The controller class
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
     * Generates Transaction object to be sent or called.
     *
     * Creates the scaffolding needed for the transaction to be executed.
     *
     * @param {Array} funcArgs A list containing all the parameters of the function
     */
    generateTransaction(funcArgs = []) {
        this._validateArgs(funcArgs);
        let callData = this._solFunction.getData();
        let transaction = !this._constant;
        let tx = {
            from: this.controller.defaultAddress,
            to: this.contractAddress
        };
        if (transaction) {
            tx.data = callData;
            if (tx.value <= 0 && this._payable)
                throw Error('Function is payable and requires `value` greater than 0.');
            else if (tx.value > 0 && !this._payable)
                throw Error('Function is not payable. Required `value` is 0.');
            return new Transaction_1.default(tx, this.controller);
        }
    }
    /**
     * Validates arguments to the function.
     *
     * This checks types as well as length of input arguments to required.
     *
     * @param {Array} args The list of arguments for the function
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
