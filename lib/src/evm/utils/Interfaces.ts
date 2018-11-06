/**
 * @file Interface.js
 * @author Mosaic Networks <https://github.com/mosaicnetworks>
 * @date 2018
 */

export interface BaseTX {
    gas?: number,
    gasPrice?: number,
}


export interface BaseAccount {
    address: string,
    nonce: number,
    balance: any
}

export interface TX extends BaseTX {
    from: string,
    to?: string,
    value?: number,
    data?: string
}

export interface ContractOptions extends BaseTX {
    from?: string,
    address?: string,
    data?: string,
    jsonInterface: ABI[]
}

export interface Input {
    name: string,
    type: string,
}

export interface ABI {
    constant?: any,
    inputs: Input[],
    name?: any,
    outputs?: any[],
    payable: any,
    stateMutability: any,
    type: any
}

export interface TXReceipt {
    root: string,
    transactionHash: string,
    from: string,
    to?: string,
    gasUsed: number,
    cumulativeGasUsed: number,
    contractAddress: string,
    logs: [],
    logsBloom: string,
    failed: boolean
}

export interface SolidityCompilerOutput {
    contracts: {},
    errors: string[],
    sourceList: string[],
    sources: {}
}



