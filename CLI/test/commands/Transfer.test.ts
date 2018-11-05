import * as Vorpal from "vorpal";
import * as Chai from 'chai';

import * as AccountsCreate from '../../src/commands/AccountsCreate';

import {stage} from '../../src/commands/Transfer';
import {otherPwdPath, pwdPath, session} from "../stage";

import Staging, {Message, StagedOutput, Args} from "../../src/classes/Staging";
import {V3JSONKeyStore} from "../../src/utils/Globals";


const assert = Chai.assert;
let account: V3JSONKeyStore;

describe('command: transfer', () => {
    it('should return error as connection is not valid', async () => {
        let args: Args = {
            options: {
                host: '127.0.0.1',
                port: 1234
            }
        };
        let result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.ERROR);
        assert.equal(result.subtype, Staging.ERRORS.INVALID_CONNECTION);
    });

    it('should return error as no address was provided', async () => {
        let args: Args = {
            options: {
                host: '127.0.0.1',
                port: 8080
            }
        };
        let result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.ERROR);
        assert.equal(result.subtype, Staging.ERRORS.BLANK_FIELD);
    });

    it('should return error as address provided does not have a keystore file', async () => {
        let args: Args = {
            options: {
                from: '2a007a8b0f179f4162f3849564948d39b843b188',
                host: '127.0.0.1',
                port: 8080
            }
        };
        let result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.ERROR);
        assert.equal(result.subtype, Staging.ERRORS.FILE_NOT_FOUND);
    });

    it('should return error as password file does not exist', async () => {
        let args: Args = {
            options: {
                from: '2a007a8b0f179f4162f3849564948d39b843b188',
                host: '127.0.0.1',
                port: 8080,
                pwd: 'not_here'
            }
        };
        let result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.ERROR);
        assert.equal(result.subtype, Staging.ERRORS.FILE_NOT_FOUND);
    });

    it('should error as trying to decrypt with wrong password file', async () => {
        let createArgs: Vorpal.Args = {
            options: {
                verbose: true,
                pwd: pwdPath
            }
        };

        // create account
        let createResult: StagedOutput<Message> = await AccountsCreate.stage(createArgs, session);

        assert.equal(createResult.type, Staging.SUCCESS);
        account = createResult.message;

        let args: Vorpal.Args = {
            options: {
                from: account.address,
                host: '127.0.0.1',
                port: 8080,
                pwd: otherPwdPath
            }
        };

        // decrypt
        let result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.ERROR);
        assert.equal(result.subtype, Staging.ERRORS.DECRYPTION);
    });

    it('should error as trying to transfer with no to or value field', async () => {
        let args: Vorpal.Args = {
            options: {
                from: account.address,
                host: '127.0.0.1',
                port: 8080,
                pwd: pwdPath
            }
        };

        let result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.ERROR);
        assert.equal(result.subtype, Staging.ERRORS.BLANK_FIELD);
    });
});