import * as Web3 from 'web3'
import * as coder from 'web3/lib/solidity/coder.js'

import * as errors from "../misc/errors"
import * as utils from "../misc/utils";
import * as checks from '../misc/checks';

import {ABI, ContractOptions, TXReceipt} from "../misc/Interfaces";
import SolidityFunction from "./SolidityFunction";
import Controller from "../Controller";
import Transaction from "./Transaction";

const web3 = new Web3();


export default class SolidityContract {
    public methods: any;
    public web3Contract: any;
    public receipt: TXReceipt;

    public constructor(readonly monetNode: Controller, public options: ContractOptions) {
        if (options.address === undefined)
            this.options.address = '';

        this.web3Contract = web3.eth.contract(this.options.jsonInterface).at(this.options.address);
        this.receipt = undefined;
        this.methods = {};

        if (this.options.address !== undefined)
            this._attachMethodsToContract();
    }

    public deploy(options: { parameters?: any[], gas: number, gasPrice: any, data?: string }): Promise<{}> {
        if (this.options.address !== '')
            throw errors.ContractAddressFieldSetAndDeployed();

        this.options.jsonInterface.filter((abi: ABI) => {
            if (abi.type === "constructor") {
                if (options.parameters)
                    checks.requireArgsLength(abi.inputs.length, options.parameters.length);
            }
        });

        if (options.data)
            this.options.data = options.data;

        if (this.options.data) {
            let encodedData: string;

            if (options.parameters)
                encodedData = this.options.data + this._encodeConstructorParams(options.parameters);

            return new Transaction({
                from: this.monetNode.defaultAddress,
                data: encodedData
            }, this.monetNode)
                .send({
                    gas: options.gas,
                    gasPrice: options.gasPrice
                })
                .then((receipt: TXReceipt) => {
                    this.receipt = receipt;
                    this.at(this.receipt.contractAddress);
                    return this
                })
        } else {
            throw errors.InvalidDataFieldInOptions();
        }
    }

    public clone(): SolidityContract {
        return this
    }

    public at(value: string) {
        this.options.address = value;
        this._attachMethodsToContract();
    }

    private _attachMethodsToContract(): void {
        this.options.jsonInterface.filter((json) => {
            return json.type == 'function';
        })
            .map((funcJSON: ABI) => {
                let solFunction = new SolidityFunction(funcJSON, this.options.address, this.monetNode);
                this.methods[funcJSON.name] = solFunction.generateTransaction.bind(solFunction);
                utils.log(utils.fgBlue, `Adding function: ${funcJSON.name}()`);
            })
    }

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