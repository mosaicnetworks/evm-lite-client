import * as JSONBig from 'json-bigint'
import * as fs from "fs";
import * as solidityCompiler from 'solc'

import {ABI, Account, SolidityCompilerOutput} from "./misc/Interfaces";
import SolidityContract from "./evm/SolidityContract";
import EVMBabbleClient from "./evm/EVMBabbleClient";
import Transaction from "./evm/Transaction";


export default class Controller {

    public defaultAddress: string;
    public accounts: Account[];
    readonly api: EVMBabbleClient;

    constructor(readonly host: string, readonly port: number) {
        this.defaultAddress = null;
        this.accounts = [];
        this.api = new EVMBabbleClient(host, port);
    }

    /**
     * Generates Contract Javascript object from Solidity Contract File.
     *
     * Takes a solidity file and generates corresponding functions associated with the contract name
     * provided. The byte-code of the contract is auto assigned to the data option field for the contract.
     *
     * @param {string} contractName
     * @param {string} filePath
     * @returns SolidityContract
     */
    ContractFromSolidityFile(contractName: string, filePath: string): SolidityContract {
        let output: SolidityCompilerOutput = solidityCompiler.compile(fs.readFileSync(filePath).toString(), 1);
        let byteCode = output.contracts[`:${contractName}`].bytecode;
        let abi = JSONBig.parse(output.contracts[`:${contractName}`].interface);

        return new SolidityContract(this, {
            jsonInterface: abi,
            data: byteCode,
        })
    };

    ContractFromABI(abi: ABI[]): SolidityContract {
        return new SolidityContract(this, {
            jsonInterface: abi,
        });
    }

    transfer(address: string, value: number): Transaction {
        return new Transaction({
            from: this.defaultAddress,
            to: address,
            value: value
        }, this)
    }

}