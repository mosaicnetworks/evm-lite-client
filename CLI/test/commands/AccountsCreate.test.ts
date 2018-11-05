import * as Chai from 'chai';
import * as path from "path";
import * as Vorpal from "vorpal";

import {stage} from '../../src/commands/AccountsCreate';
import {datadir, password, pwdPath, session} from "../stage";

import Staging, {Message, StagedOutput} from "../../src/classes/Staging";


const assert = Chai.assert;

describe('Command: accounts create', () => {
    it('should return non-verbose output of newly created account with password file', async () => {
        const args: Vorpal.Args = {
            options: {
                pwd: pwdPath,
            }
        };
        const result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.SUCCESS);

        // check output directory and password was what was expected
        assert.equal(result.args.options.pwd, password);
        assert.equal(result.args.options.output, path.join(datadir, 'keystore'));

        assert.equal(result.args.options.verbose, undefined);
    });

    it('should return verbose output of newly created account', async () => {
        const args: Vorpal.Args = {
            options: {
                pwd: pwdPath,
                verbose: true,
            }
        };
        const result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.SUCCESS);

        // check output directory and password was what was expected
        assert.equal(result.args.options.pwd, password);
        assert.equal(result.args.options.output, path.join(datadir, 'keystore'));

        assert.equal(result.args.options.verbose, true);
    });

    it('should return error as password file does not exist', async () => {
        const args: Vorpal.Args = {
            options: {
                pwd: '/directory_xyz/not_here.txt'
            }
        };
        const result: StagedOutput<any> = await stage(args, session);

        assert.equal(result.type, Staging.ERROR);
        assert.equal(result.subtype, Staging.ERRORS.PATH_NOT_EXIST);
    });

    it('should return error as output directory does not exists', async () => {
        const args: Vorpal.Args = {
            options: {
                output: '/directory_xyz/not_here',
                pwd: pwdPath,
            }
        };
        const result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.ERROR);
        assert.equal(result.subtype, Staging.ERRORS.DIRECTORY_NOT_EXIST);
    });

    it('should return error as password file is a directory', async () => {
        const args: Vorpal.Args = {
            options: {
                pwd: datadir,
            }
        };
        const result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.ERROR);
        assert.equal(result.subtype, Staging.ERRORS.IS_DIRECTORY);
    });

    it('should return error as output directory is a file', async () => {
        const args: Vorpal.Args = {
            options: {
                output: pwdPath,
                pwd: pwdPath,
            }
        };
        const result: StagedOutput<Message> = await stage(args, session);

        assert.equal(result.type, Staging.ERROR);
        assert.equal(result.subtype, Staging.ERRORS.IS_FILE);
    });
});