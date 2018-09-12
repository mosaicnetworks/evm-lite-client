interface BaseTX {
    gas?: number,
    gasPrice?: number,
}

declare interface TX extends BaseTX {
    from: string,
    to?: string,
    value?: number,
    data?: string
}

declare interface ContractOptions extends BaseTX {
    from?: string,
    address?: string,
    data?: string,
    jsonInterface: ABI[]
}

declare interface Input {
    name: string,
    type: string,
}

declare interface ABI {
    constant?: any,
    inputs: Input[],
    name?: any,
    outputs?: any[],
    payable: any,
    stateMutability: any,
    type: any
}

declare interface Account {
    address: string,
    balance: number,
    nonce: number,
}

declare interface TXReceipt {
    root: string,
    transactionHash: string,
    from: string,
    to?: string,
    gasUsed: number,
    cumulativeGasUsed: number,
    contractAddress: string,
    logs: [],
    logsBloom: string
}

declare interface SolidityCompilerOutput {
    contracts: {},
    errors: string[],
    sourceList: string[],
    sources: {}
}

declare class EVMBabbleClient {
    readonly host: string;
    readonly port: number;

    constructor(host: string, port: string);

    getAccount(address: string): Promise<string>;
    getAccount(): Promise<string>;

    call(tx: string): Promise<string>;

    sendTx(tx: string): Promise<string>;

    sendRawTx(tx: string): Promise<string>;

    getReceipt(txHash: string): Promise<string>;
}

declare class Transaction {
    tx: TX;
    receipt: TXReceipt;
    readonly controller: Controller;

    constructor(options: TX, controller: Controller);

    send(options: { to?: string, from?: string, value?: number, gas?: number, gasPrice?: any }): any;

    call(options: { gas: number, gasPrice: number }): any;
}

declare class SolidityFunction {
    readonly name: string;
    readonly contractAddress: string;
    readonly controller: Controller;

    constructor(ABI: ABI, contractAddress: string, controller: Controller);

    generateTransaction(funcArgs: any[]): Transaction;
}

declare class SolidityContract {
    methods: any;
    receipt: TXReceipt;
    options: ContractOptions;
    readonly controller: Controller;

    constructor(options: ContractOptions, controller: Controller);

    deploy(options?: { parameters?: any[], gas?: number, gasPrice?: any, data?: string }): Promise<TXReceipt>;

    address(address: string): SolidityContract;

    gas(gas: number): SolidityContract;

    gasPrice(gasPrice: number): SolidityContract;

    data(data: string): SolidityContract;

    JSONInterface(abis: ABI[]): SolidityContract;
}

declare class Controller {
    defaultAddress: string;
    accounts: Account[];
    api: EVMBabbleClient;
    host: string;
    port: number;

    constructor(host: string, port: string);

    ContractFromSolidityFile(contractName: string, filePath: string): SolidityContract;

    ContractFromABI(abi: ABI[]): SolidityContract;

    transfer(address: string, value: number): Transaction;
}

export = Controller;