import * as ASCIITable from 'ascii-table';
import * as JSONBig from 'json-bigint';

import Globals, {BaseAccount, TXReceipt, v3JSONKeyStore} from "./Globals";

import Session from "../classes/Session";


type Args = {
    [key: string]: any;
    options: {
        [key: string]: any;
    };
}

export type Message = BaseAccount[] | TXReceipt | v3JSONKeyStore | ASCIITable | string;

export type StagedOutput<Message> = {
    type: string;
    subtype: string;
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
    static SUCCESS = 'success';
    static SUBTYPES = {
        errors: {
            BLANK_FIELD: 'Field(s) should not be blank',
            DIRECTORY_NOT_EXIST: 'Directory should exist',
            PATH_NOT_EXIST: 'Path(s) should exist',
            IS_FILE: 'Should be a directory',
            IS_DIRECTORY: 'Should not be a directory',
            FILE_NOT_FOUND: 'Cannot find file',
            INVALID_CONNECTION: 'Invalid connection',
            OTHER: 'Something went wrong'
        },
        success: {
            COMMAND_EXECUTION_COMPLETED: 'Command was executed successfully'
        },
    };

    constructor() {
    }

    static construct(args: Args, type: string, subtype: string, message: Message = null): StagedOutput<Message> {
        return {
            type: type,
            subtype: subtype,
            args: args,
            message: message
        }
    };

}