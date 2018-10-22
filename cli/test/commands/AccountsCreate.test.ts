import * as Chai from 'chai';
import * as Vorpal from "vorpal";
import * as path from "path";

import {stage} from '../../src/commands/AccountsCreate';
import {datadir, password, pwdPath, session} from "../constants";

import Staging, {StagedOutput} from "../../src/utils/Staging";


const assert = Chai.assert;

describe('Command: accounts create', () => {
    it('should return non-verbose output of newly created account with password file', async () => {
        let args: Vorpal.Args = {
            options: {
                password: pwdPath,
            }
        };
        let result: StagedOutput<any> = await stage(args, session);

        assert.equal(result.type, Staging.SUCCESS);
        assert.equal(result.subtype, Staging.SUBTYPES.success.COMMAND_EXECUTION_COMPLETED);

        // check output directory and password was what was expected
        assert.equal(result.args.options.password, password);
        assert.equal(result.args.options.output, path.join(datadir, 'keystore'));

        assert.equal(result.args.options.verbose, undefined);
    });

    it('should return verbose output of newly created account', async () => {
        let args: Vorpal.Args = {
            options: {
                verbose: true,
                password: pwdPath,
            }
        };
        let result: StagedOutput<any> = await stage(args, session);

        assert.equal(result.type, Staging.SUCCESS);
        assert.equal(result.subtype, Staging.SUBTYPES.success.COMMAND_EXECUTION_COMPLETED);

        // check output directory and password was what was expected
        assert.equal(result.args.options.password, password);
        assert.equal(result.args.options.output, path.join(datadir, 'keystore'));

        assert.equal(result.args.options.verbose, true);
    });

    it('should return error as password file does not exist', async () => {
        let args: Vorpal.Args = {
            options: {
                password: '/directory_xyz/not_here.txt'
            }
        };
        let result: StagedOutput<any> = await stage(args, session);

        assert.equal(result.type, Staging.ERROR);
        assert.equal(result.subtype, Staging.SUBTYPES.errors.PATH_NOT_EXIST);
    });

    it('should return error as output directory does not exists', async () => {
        let args: Vorpal.Args = {
            options: {
                password: pwdPath,
                output: '/directory_xyz/not_here'
            }
        };
        let result: StagedOutput<any> = await stage(args, session);

        assert.equal(result.type, Staging.ERROR);
        assert.equal(result.subtype, Staging.SUBTYPES.errors.DIRECTORY_NOT_EXIST);
    });

    it('should return error as password file is a directory', async () => {
        let args: Vorpal.Args = {
            options: {
                password: datadir,
            }
        };
        let result: StagedOutput<any> = await stage(args, session);

        assert.equal(result.type, Staging.ERROR);
        assert.equal(result.subtype, Staging.SUBTYPES.errors.IS_DIRECTORY);
    });

    it('should return error as output directory is a file', async () => {
        let args: Vorpal.Args = {
            options: {
                password: pwdPath,
                output: pwdPath,
            }
        };
        let result: StagedOutput<any> = await stage(args, session);

        assert.equal(result.type, Staging.ERROR);
        assert.equal(result.subtype, Staging.SUBTYPES.errors.IS_FILE);
    });
});