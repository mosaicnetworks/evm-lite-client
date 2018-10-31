import * as Chai from 'chai';
import * as Vorpal from "vorpal";

import {stage} from '../../src/commands/TransactionsGet';
import {session} from "../stage";

import Staging, {Message, StagedOutput} from "../../src/classes/Staging";


const assert = Chai.assert;

describe('Command: transactions get', () => {
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

    it('should return error no hash was provided', async () => {
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
});