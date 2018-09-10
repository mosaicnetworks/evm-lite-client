"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JSONBig = require("json-bigint");
const fs = require("fs");
const solidityCompiler = require("solc");
const SolidityContract_1 = require("./evm/SolidityContract");
const EVMBabbleClient_1 = require("./evm/EVMBabbleClient");
const Transaction_1 = require("./evm/Transaction");
class Controller {
    constructor(host, port) {
        this.host = host;
        this.port = port;
        this.defaultAddress = null;
        this.accounts = [];
        this.api = new EVMBabbleClient_1.default(host, port);
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
    ContractFromSolidityFile(contractName, filePath) {
        let output = solidityCompiler.compile(fs.readFileSync(filePath).toString(), 1);
        let byteCode = output.contracts[`:${contractName}`].bytecode;
        let abi = JSONBig.parse(output.contracts[`:${contractName}`].interface);
        return new SolidityContract_1.default(this, {
            jsonInterface: abi,
            data: byteCode,
        });
    }
    ;
    ContractFromABI(abi) {
        return new SolidityContract_1.default(this, {
            jsonInterface: abi,
        });
    }
    transfer(address, value) {
        return new Transaction_1.default({
            from: this.defaultAddress,
            to: address,
            value: value
        }, this);
    }
}
exports.default = Controller;
