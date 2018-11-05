import * as Chai from 'chai';
import * as Vorpal from "vorpal";

import * as AccountsCreate from '../../src/commands/AccountsCreate';

import {stage} from '../../src/commands/AccountsUpdate';
import {otherPwdPath, pwdPath, session} from "../stage";

import Staging, {Message, StagedOutput} from "../../src/classes/Staging";
import {V3JSONKeyStore} from "../../src/utils/Globals";


const assert = Chai.assert;
let account: V3JSONKeyStore;

describe('command: accounts update', () => {
    it('should return error as no address was provided', async () => {
        let args: Vorpal.Args = {
            options: {}
        };
        let result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.ERROR);
        assert.equal(result.subtype, Staging.ERRORS.BLANK_FIELD);
    });

    it('should return error as address provided does not exist locally', async () => {
        let args: Vorpal.Args = {
            address: 'does_not_exist',
            options: {}
        };
        let result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.ERROR);
        assert.equal(result.subtype, Staging.ERRORS.FILE_NOT_FOUND);
    });

    // create account and decrypt
    it('should error as trying to decrypt with wrong password', async () => {
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
            address: account.address,
            options: {
                old: otherPwdPath,
                new: pwdPath
            }
        };

        // decrypt
        let result: StagedOutput<Message> = await stage(args, session);
        assert.equal(result.type, Staging.ERROR);
        assert.equal(result.subtype, Staging.ERRORS.DECRYPTION);
    });

    it('should return error as old password file does not exist', async () => {
        let args: Vorpal.Args = {
            address: account.address,
            options: {
                old: 'does_not_exist'
            }
        };
        let result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.ERROR);
        assert.equal(result.subtype, Staging.ERRORS.FILE_NOT_FOUND);
    });

    it('should return error as new password file does not exist', async () => {
        let args: Vorpal.Args = {
            address: account.address,
            options: {
                old: pwdPath,
                new: 'does_not_exist'
            }
        };
        let result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.ERROR);
        assert.equal(result.subtype, Staging.ERRORS.FILE_NOT_FOUND);
    });

    it('should return newly encrypted account', async () => {
        let args: Vorpal.Args = {
            address: account.address,
            options: {
                old: pwdPath,
                new: otherPwdPath,
            }
        };
        let result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.SUCCESS);
        assert.notEqual(result.message.address, undefined);
    });


});