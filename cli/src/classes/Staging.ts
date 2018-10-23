import * as ASCIITable from 'ascii-table';
import * as JSONBig from 'json-bigint';

import Globals, {BaseAccount, SentTx, TXReceipt, v3JSONKeyStore} from "../utils/Globals";

import Session from "./Session";
import * as fs from "fs";


type Args = {
    [key: string]: any;
    options: {
        [key: string]: any;
    };
}

export type Message = SentTx[] | BaseAccount[] | TXReceipt | v3JSONKeyStore | ASCIITable | Object | string;

export type StagedOutput<Message> = {
    type: string;
    subtype?: string;
    args: Args,
    message?: Message;
}


export type StagingFunction = (args: Args, session: Session) => Promise<StagedOutput<Message>>;

export const execute = (fn: StagingFunction, args: Args, session: Session): Promise<void> => {
    return new Promise<void>(async (resolve) => {
        let output: StagedOutput<Message> = await fn(args, session);
        let message: string;

        if (output.message) {
            switch (typeof output.message) {
                case 'string':
                    message = output.message;
                    break;
                case 'object':
                    message = (output.message instanceof ASCIITable) ? output.message.toString() : JSONBig.stringify(output.message);
                    break;
            }
        } else {
            message = output.subtype + '.';
        }

        Globals[output.type](`${message.charAt(0).toUpperCase() + message.slice(1)}`);
        resolve();
    });
};

export default class Staging {
    static ERROR = 'error';
    static ERRORS = {
        BLANK_FIELD: 'Field(s) should not be blank',
        DIRECTORY_NOT_EXIST: 'Directory should exist',
        PATH_NOT_EXIST: 'Path(s) should exist',
        IS_FILE: 'Should be a directory',
        IS_DIRECTORY: 'Should not be a directory',
        FILE_NOT_FOUND: 'Cannot find file',
        INVALID_CONNECTION: 'Invalid connection',
        FETCH_FAILED: 'Could not fetch data',
        OTHER: 'Something went wrong'
    };
    static SUCCESS = 'success';

    constructor() {
    }

    static exists(path: string): boolean {
        return fs.existsSync(path);
    }

    static isDirectory(path: string): boolean {
        return fs.lstatSync(path).isDirectory();
    }

    static success(args: Args, message: Message) {
        return {
            type: Staging.SUCCESS,
            args: args,
            message: message
        }
    }

    static error(args: Args, subtype: string, message: Message = null) {
        return {
            type: Staging.ERROR,
            subtype: subtype,
            args: args,
            message: message
        }
    }

    static getStagingFunctions(args: Args) {
        return {error: Staging.error.bind(null, args), success: Staging.success.bind(null, args)}
    }
}