import * as Chai from 'chai';
import * as Vorpal from "vorpal";
import * as ASCIITable from 'ascii-table';

import {stage} from '../../src/commands/TransactionsList';
import {session} from "../constants";

import Staging, {Message, StagedOutput} from "../../src/classes/Staging";


const assert = Chai.assert;

describe('command: transactions list', () => {
    it('should return error a valid connection to a node is required', async () => {
        let args: Vorpal.Args = {
            options: {
                verbose: true,
                host: '127.0.0.1',
                port: '1234',
            }
        };
        let result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.ERROR);
        assert.equal(result.subtype, Staging.ERRORS.INVALID_CONNECTION);
    });

    it('should return list of Transactions even with a valid connection', async () => {
        let args: Vorpal.Args = {
            options: {
                host: '127.0.0.1',
                port: '8080',
            }
        };
        let result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.SUCCESS);

        assert.equal(result.message instanceof Array, true)
    });

    it('should return ASCIITable with a valid connection', async () => {
        let args: Vorpal.Args = {
            options: {
                formatted: true,
                host: '127.0.0.1',
                port: '8080',
            }
        };
        let result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.SUCCESS);

        assert.equal(result.message instanceof ASCIITable || result.message instanceof Array, true)
    });
});