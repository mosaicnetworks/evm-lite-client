import * as Chai from 'chai';
import * as Vorpal from "vorpal";
import * as ASCIITable from 'ascii-table';

import {stage} from '../../src/commands/AccountsList';
import {session} from "../constants";

import Staging, {Message, StagedOutput} from "../../src/utils/Staging";


const assert = Chai.assert;

describe('command: accounts list', () => {
    it('should return error as verbose requires a valid connection to a node', async () => {
        let args: Vorpal.Args = {
            options: {
                verbose: true,
                host: '127.0.0.1',
                port: '1234',
            }
        };
        let result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.ERROR);
        assert.equal(result.subtype, Staging.SUBTYPES.errors.INVALID_CONNECTION);
    });

    it('should return ASCIITable with verbose and formatted with valid connection', async () => {
        let args: Vorpal.Args = {
            options: {
                verbose: true,
                formatted: true,
                host: '127.0.0.1',
                port: '8080',
            }
        };
        let result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.SUCCESS);
        assert.equal(result.subtype, Staging.SUBTYPES.success.COMMAND_EXECUTION_COMPLETED);

        assert.equal(result.message instanceof ASCIITable, true)
    });

    it('should return list of BaseAccounts even without a valid connection', async () => {
        let args: Vorpal.Args = {
            options: {
                host: '127.0.0.1',
                port: '1234',
            }
        };
        let result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.SUCCESS);
        assert.equal(result.subtype, Staging.SUBTYPES.success.COMMAND_EXECUTION_COMPLETED);

        assert.equal(result.message instanceof Array, true)
    });

    it('should return ASCIITable even without a valid connection', async () => {
        let args: Vorpal.Args = {
            options: {
                formatted: true,
                host: '127.0.0.1',
                port: '1234',
            }
        };
        let result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.SUCCESS);
        assert.equal(result.subtype, Staging.SUBTYPES.success.COMMAND_EXECUTION_COMPLETED);

        assert.equal(result.message instanceof ASCIITable, true)
    });
});