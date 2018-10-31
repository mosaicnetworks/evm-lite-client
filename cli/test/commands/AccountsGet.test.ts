import * as Chai from 'chai';
import * as Vorpal from "vorpal";

import {stage} from '../../src/commands/AccountsGet';
import {session} from "../stage";

import Staging, {Message, StagedOutput} from "../../src/classes/Staging";


const assert = Chai.assert;

describe('Command: accounts get', () => {
    it('should return error as socket provided is not running an active node', async () => {
        let args: Vorpal.Args = {
            options: {
                host: '127.0.0.1',
                port: '1234',
            }
        };
        let result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.ERROR);
        assert.equal(result.subtype, Staging.ERRORS.INVALID_CONNECTION);
    });

    it('should return error no address was provided', async () => {
        let args: Vorpal.Args = {
            options: {
                host: '127.0.0.1',
                port: '8080',
            }
        };
        let result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.ERROR);
        assert.equal(result.subtype, Staging.ERRORS.BLANK_FIELD);
    });

    it('should return unformatted output for provided address', async () => {
        let args: Vorpal.Args = {
            address: '0x3d906545a6f4e20062fe1e08760cfdbead0d1d96',
            options: {
                host: '127.0.0.1',
                port: '8080',
            }
        };
        let result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.SUCCESS);

        assert.equal(result.args.address, '0x3d906545a6f4e20062fe1e08760cfdbead0d1d96');
        assert.equal(result.args.options.formatted, undefined);
    });

    it('should return formatted output for provided address', async () => {
        let args: Vorpal.Args = {
            address: '0x3d906545a6f4e20062fe1e08760cfdbead0d1d96',
            options: {
                host: '127.0.0.1',
                port: '8080',
                formatted: true
            }
        };
        let result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.SUCCESS);

        assert.equal(result.args.address, '0x3d906545a6f4e20062fe1e08760cfdbead0d1d96');
        assert.equal(result.args.options.formatted, true);
    });
});