import * as ASCIITable from 'ascii-table';
import * as Chai from 'chai';
import * as Vorpal from "vorpal";

import {stage} from '../../src/commands/AccountsList';
import {session} from "../stage";

import Staging, {Message, StagedOutput} from "../../src/classes/Staging";


const assert = Chai.assert;

describe('command: accounts list', () => {
    it('should return error as verbose requires a valid connection to a node', async () => {
        const args: Vorpal.Args = {
            options: {
                host: '127.0.0.1',
                port: '1234',
                verbose: true,
            }
        };
        const result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.ERROR);
        assert.equal(result.subtype, Staging.ERRORS.INVALID_CONNECTION);
    });

    it('should return ASCIITable with verbose and formatted with valid connection', async () => {
        const args: Vorpal.Args = {
            options: {
                formatted: true,
                host: '127.0.0.1',
                port: '8080',
                verbose: true,
            }
        };
        const result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.SUCCESS);

        assert.equal(result.message instanceof ASCIITable, true)
    });

    it('should return list of BaseAccounts even without a valid connection', async () => {
        const args: Vorpal.Args = {
            options: {
                host: '127.0.0.1',
                port: '1234',
            }
        };
        const result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.SUCCESS);

        assert.equal(result.message instanceof Array, true)
    });

    it('should return ASCIITable even without a valid connection', async () => {
        const args: Vorpal.Args = {
            options: {
                formatted: true,
                host: '127.0.0.1',
                port: '1234',
            }
        };
        const result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.SUCCESS);

        assert.equal(result.message instanceof ASCIITable, true)
    });
});