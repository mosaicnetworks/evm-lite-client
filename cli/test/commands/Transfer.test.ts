import * as Chai from 'chai';
import * as Vorpal from "vorpal";

import * as AccountsCreate from '../../src/commands/AccountsCreate';

import {stage} from '../../src/commands/Transfer';
import {otherPwdPath, pwdPath, session} from "../stage";

import Staging, {Args, Message, StagedOutput} from "../../src/classes/Staging";
import {V3JSONKeyStore} from "../../src/utils/Globals";


const assert = Chai.assert;
let account: V3JSONKeyStore;

describe('command: transfer', () => {
    it('should return error as connection is not valid', async () => {
        const args: Args = {
            options: {
                host: '127.0.0.1',
                port: 1234
            }
        };
        const result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.ERROR);
        assert.equal(result.subtype, Staging.ERRORS.INVALID_CONNECTION);
    });

    it('should return error as no address was provided', async () => {
        const args: Args = {
            options: {
                host: '127.0.0.1',
                port: 8080
            }
        };
        const result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.ERROR);
        assert.equal(result.subtype, Staging.ERRORS.BLANK_FIELD);
    });

    it('should return error as address provided does not have a keystore file', async () => {
        const args: Args = {
            options: {
                from: '2a007a8b0f179f4162f3849564948d39b843b188',
                host: '127.0.0.1',
                port: 8080
            }
        };
        const result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.ERROR);
        assert.equal(result.subtype, Staging.ERRORS.FILE_NOT_FOUND);
    });

    it('should return error as password file does not exist', async () => {
        const args: Args = {
            options: {
                from: '2a007a8b0f179f4162f3849564948d39b843b188',
                host: '127.0.0.1',
                port: 8080,
                pwd: 'not_here'
            }
        };
        const result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.ERROR);
        assert.equal(result.subtype, Staging.ERRORS.FILE_NOT_FOUND);
    });

    it('should error as trying to decrypt with wrong password file', async () => {
        const createArgs: Vorpal.Args = {
            options: {
                pwd: pwdPath,
                verbose: true,
            }
        };

        // create account
        const createResult: StagedOutput<Message> = await AccountsCreate.stage(createArgs, session);

        assert.equal(createResult.type, Staging.SUCCESS);
        account = createResult.message;

        const args: Vorpal.Args = {
            options: {
                from: account.address,
                host: '127.0.0.1',
                port: 8080,
                pwd: otherPwdPath
            }
        };

        // decrypt
        const result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.ERROR);
        assert.equal(result.subtype, Staging.ERRORS.DECRYPTION);
    });

    it('should error as trying to transfer with no to or value field', async () => {
        const args: Vorpal.Args = {
            options: {
                from: account.address,
                host: '127.0.0.1',
                port: 8080,
                pwd: pwdPath
            }
        };

        const result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.ERROR);
        assert.equal(result.subtype, Staging.ERRORS.BLANK_FIELD);
    });
});