declare module 'evmlsdk' {

    interface BaseTX {
        gas?: number;
        gasPrice?: number;
    }

    interface TX extends BaseTX {
        from: string;
        to?: string;
        value?: number;
        data?: string;
    }

    interface ContractOptions extends BaseTX {
        from?: string;
        address?: string;
        data?: string;
        jsonInterface: ABI[];
    }

    interface Input {
        name: string;
        type: string;
    }

    interface ABI {
        constant?: any;
        inputs: Input[];
        name?: any;
        outputs?: any[];
        payable: any;
        stateMutability: any;
        type: any;
    }

    interface Account {
        address: string;
        balance: number;
        nonce: number;
    }

    interface TXReceipt {
        root: string;
        transactionHash: string;
        from: string;
        to?: string;
        gasUsed: number;
        cumulativeGasUsed: number;
        contractAddress: string;
        logs: [];
        logsBloom: string;
    }

    interface SolidityCompilerOutput {
        contracts: {};
        errors: string[];
        sourceList: string[];
        sources: {};
    }

    class EVMLiteClient {
        readonly host: string;
        readonly port: number;
        private _constructOptions;

        constructor(host: string, port: number);

        getAccount(address: string): Promise<String>;

        getAccounts(): Promise<string>;

        call(tx: string): Promise<{}>;

        sendTx(tx: string): Promise<{}>;

        sendRawTx(tx: string): Promise<{}>;

        getReceipt(txHash: string): Promise<{}>;
    }

    class Transaction {
        readonly controller: Controller;
        tx: TX;
        receipt: TXReceipt;

        /**
         * Transaction object to be sent or called.
         *
         * @param {TX} options The transaction options eg. gas, gas price, value...
         * @param {Controller} controller The controller class
         */
        constructor(options: TX, controller: Controller);

        /**
         * Send transaction.
         *
         * This function will mutate the state of the EVM.
         *
         * @param {Object} options
         */
        send(options: {
            to?: string;
            from?: string;
            value?: number;
            gas?: number;
            gasPrice?: any;
        }): any;

        /**
         * Call transaction.
         *
         * This function will not mutate the state of the EVM.
         *
         * @param {Object} options
         */
        call(options: {
            gas: number;
            gasPrice: number;
        }): Promise<{}>;
    }


    class SolidityContract {
        options: ContractOptions;
        readonly controller: Controller;
        methods: any;
        web3Contract: any;
        receipt: TXReceipt;

        /**
         * Attaches functions to contract.
         *
         * Parses function data from ABI and creates Javascript object representation then adds
         * these functions to Contract.methods.
         *
         * @private
         */
        private _attachMethodsToContract;

        /**
         * Encodes constructor parameters.
         *
         * @param {Array} params The parameters to encode
         * @private
         */
        private _encodeConstructorParams;

        /**
         * Javascript Object representation of a Solidity contract.
         *
         * Can either be used to deploy a contract or interact with a contract already deployed.
         *
         * @param {Controller} controller Controller Javascript object
         * @param {ContractOptions} options The options of the contract. eg. gas price, gas, address
         * @constructor
         */
        constructor(options: ContractOptions, controller: Controller);

        /**
         * Deploy contract to the blockchain.
         *
         * Deploys contract to the blockchain and sets the newly acquired address of the new contract.
         * Also assigns the transaction receipt to this.
         *
         * @param {Object} options The options for the contract. eg. constructor params, gas, gas price, data
         * @returns {SolidityContract} Returns deployed contract with receipt and address attributes
         */
        deploy(options?: {
            parameters?: any[];
            gas?: number;
            gasPrice?: any;
            data?: string;
        }): any;

        /**
         * Sets the address of the contract and populates Solidity functions.
         *
         * @param {string} address The address to assign to the contract
         * @returns {SolidityContract} The contract
         */
        address(address: string): SolidityContract;

        /**
         * Sets the gas of the contract.
         *
         * @param {number} gas The gas to assign to the contract
         * @returns {SolidityContract} The contract
         */
        gas(gas: number): SolidityContract;

        /**
         * Sets the gas price for deploying the contract.
         *
         * @param {number} gasPrice The gas price to assign to the contract
         * @returns {SolidityContract} The contract
         */
        gasPrice(gasPrice: number): SolidityContract;

        /**
         * Sets the data for deploying the contract.
         *
         * @param {string} data The data of the contract
         * @returns {SolidityContract} The contract
         */
        data(data: string): SolidityContract;

        /**
         * Sets the JSON Interface of the contract.
         *
         * @param {ABI[]} abis The JSON Interface of contract
         * @returns {SolidityContract} The contract
         */
        JSONInterface(abis: ABI[]): SolidityContract;
    }


    export class Controller {
        readonly host: string;
        readonly port: number;
        defaultAddress: string;
        accounts: Account[];
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
        constructor(host: string, port?: number);

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
        ContractFromSolidityFile(contractName: string, filePath: string): SolidityContract;

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
        ContractFromABI(abi: ABI[]): SolidityContract;

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
        transfer(address: string, value: number): Transaction;
    }

}
