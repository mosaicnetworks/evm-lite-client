import * as ASCIITable from 'ascii-table';
import * as fs from "fs";
import * as JSONBig from 'json-bigint';

import Globals, {BaseAccount, SentTx, TXReceipt, V3JSONKeyStore} from "../utils/Globals";

import Session from "./Session";


export interface Args {
    [key: string]: any;
    options: {
        [key: string]: any;
    };
}

export type Message = SentTx[] | BaseAccount[] | TXReceipt | V3JSONKeyStore | ASCIITable | object | string;

export interface StagedOutput<Message> {
    type: string;
    subtype?: string;
    args: Args,
    message?: Message;
}


export type StagingFunction = (args: Args, session: Session) => Promise<StagedOutput<Message>>;


export default class Staging {
    public static ERROR = 'error';
    public static SUCCESS = 'success';
    public static ERRORS = {
        BLANK_FIELD: 'Field(s) should not be blank',
        DECRYPTION: 'Failed decryption',
        DIRECTORY_NOT_EXIST: 'Directory should exist',
        FETCH_FAILED: 'Could not fetch data',
        FILE_NOT_FOUND: 'Cannot find file',
        INVALID_CONNECTION: 'Invalid connection',
        IS_DIRECTORY: 'Should not be a directory',
        IS_FILE: 'Should be a directory',
        OTHER: 'Something went wrong',
        PATH_NOT_EXIST: 'Path(s) should exist',
    };

    public static exists(path: string): boolean {
        return fs.existsSync(path);
    }

    public static isDirectory(path: string): boolean {
        return fs.lstatSync(path).isDirectory();
    }

    public static success(args: Args, message: Message) {
        return {
            args,
            message,
            type: Staging.SUCCESS,
        }
    }

    public static error(args: Args, subtype: string, message: Message = null) {
        return {
            args,
            message,
            subtype,
            type: Staging.ERROR,
        }
    }

    public static getStagingFunctions(args: Args): { error: (subtype: string, message?: Message) => StagedOutput<Message>, success: (message: Message) => StagedOutput<Message> } {
        return {
            error: Staging.error.bind(null, args),
            success: Staging.success.bind(null, args)
        }
    }

    constructor() {
    }
}

export const execute = (fn: StagingFunction, args: Args, session: Session): Promise<void> => {
    return new Promise<void>(async (resolve) => {
        const output: StagedOutput<Message> = await fn(args, session);
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
