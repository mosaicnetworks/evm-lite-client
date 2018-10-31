import * as Chai from 'chai';
import * as Vorpal from "vorpal";
import * as ASCIITable from 'ascii-table';

import {stage} from '../../src/commands/Info';
import {session} from "../stage";

import Staging, {Message, StagedOutput} from "../../src/classes/Staging";


const assert = Chai.assert;

describe('command: info', () => {
    it('should return error as host and port provided does not have a node running', async () => {
        let args: Vorpal.Args = {
            options: {
                host: '127.0.0.1',
                port: 1234
            }
        };
        let result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.ERROR);
        assert.equal(result.subtype, Staging.ERRORS.INVALID_CONNECTION);
    });

    it('should return unformatted information object', async () => {
        let args: Vorpal.Args = {
            options: {
                host: '127.0.0.1',
                port: 8080
            }
        };
        let result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.SUCCESS);

        // info.type exists
        assert.notEqual(result.message.type, undefined);
    });

    it('should return formatted ASCIITable object for info endpoint', async () => {
        let args: Vorpal.Args = {
            options: {
                formatted: true,
                host: '127.0.0.1',
                port: 8080
            }
        };
        let result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.SUCCESS);

        assert.equal(result.message instanceof ASCIITable, true);
    });
});