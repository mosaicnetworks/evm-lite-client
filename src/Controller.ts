import * as JSONBig from 'json-bigint'
import * as fs from "fs";
import * as solidityCompiler from 'solc'

import {ABI, Account, SolidityCompilerOutput} from "./misc/Interfaces";

import SolidityContract from "./evm/SolidityContract";
import EVMLiteClient from "./evm/EVMLiteClient";
import Transaction from "./evm/Transaction";
import * as u from "./misc/utils";


export default class Controller {

    public defaultAddress: string;
    public accounts: Account[];
    readonly api: EVMLiteClient;

    /**
     * Creates a controller instance.
     *
     * This class controls all of functionality for interacting with an EVM-Lite node.
     *
     * @param {string} host The IP or alias of the EVM-Lite node
     * @param {number} port Port to access the service. default = 8080
     * @constructor
     */
    constructor(readonly host: string, readonly port: number = 8080) {
        this.defaultAddress = null;
        this.accounts = [];
        this.api = new EVMLiteClient(host, port);

        u.log(u.fgGreen, `Connected to ${host}:${port}.`)
    }

    /**
     * Generates Javascript object from Solidity Contract File.
     *
     * Takes a solidity file and generates corresponding functions associated with the contract
     * name provided. The byte-code of the contract is auto-assigned to the data option field
     * for the contract.
     *
     * @param {string} contractName Name of the Contract to get from Solidity file
     * @param {string} filePath Absolute or relative path of the Solidity file.
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
        }, this)
    };

    /**
     * Generates Contract Javascript object from Solidity Contract File.
     *
     * Takes ABI and generates corresponding functions associated with the contract provided.
     * The byte-code of the contract needs to be assigned before deploying. Mostly used to
     * interact with already deployed contracts.
     *
     * @param {ABI[]} abi The Application Binary Interface of the Solidity contract
     * @returns {SolidityContract} A Javascript object representation of solidity contract
     */
    ContractFromABI(abi: ABI[]): SolidityContract {
        this._requireDefaultFromAddress();

        return new SolidityContract({
            jsonInterface: abi,
        }, this);
    }

    /**
     * Transfer a specified value to the desired address.
     *
     * Sender address can be set after instantiating the Controller object (recommended) or
     * after the Transaction object has been created.
     *
     * @param {string} address The address of the receiver
     * @param {number} value The value to send the receiver
     * @returns {Transaction} the required Transaction object for transfer request
     */
    transfer(address: string, value: number): Transaction {
        this._requireDefaultFromAddress();

        return new Transaction({
            from: this.defaultAddress,
            to: address,
            value: value
        }, false, undefined, this)
    }

    /**
     * Require default from address to be set.
     *
     * @private
     */
    private _requireDefaultFromAddress(): void {
        if (this.defaultAddress == null)
            throw new Error('Please set default from address.');
    };
}