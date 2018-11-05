"use strict";
/**
 * @file AccountsCreate.ts
 * @author Mosaic Networks <https://github.com/mosaicnetworks>
 * @date 2018
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ASCIITable = require("ascii-table");
const Staging_1 = require("../classes/Staging");
/**
 * Should return either a Staged error or success.
 *
 * @remarks
 * This staging function will parse all the arguments of the `info` command
 * and resolve a success or an error.
 *
 * @param args - Arguments to the command.
 * @param session - Controls the session of the CLI instance.
 * @returns An object specifying a success or an error.
 *
 * @alpha
 */
exports.stage = (args, session) => {
    return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
        const { error, success } = Staging_1.default.getStagingFunctions(args);
        const connection = yield session.connect(args.options.host, args.options.port);
        if (!connection) {
            resolve(error(Staging_1.default.ERRORS.INVALID_CONNECTION));
            return;
        }
        const information = yield connection.api.getInfo();
        if (!information) {
            resolve(error(Staging_1.default.ERRORS.FETCH_FAILED, 'Cannot fetch information.'));
            return;
        }
        const formatted = args.options.formatted || false;
        if (!formatted) {
            resolve(success(information));
            return;
        }
        const table = new ASCIITable().setHeading('Name', 'Value');
        for (const key in information) {
            if (information.hasOwnProperty(key)) {
                table.addRow(key, information[key]);
            }
        }
        resolve(success(table));
    }));
};
/**
 * Should construct a Vorpal.Command instance for the command `info`.
 *
 * @remarks
 * Prints information about the node in JSON or formatted into an ASCII table.
 *
 * Usage: `info --formatted`
 *
 * Here we have executed a command to view information about the node in an ASCII table.
 *
 * @param evmlc - The CLI instance.
 * @param session - Controls the session of the CLI instance.
 * @returns The Vorpal.Command instance of `accounts get`.
 *
 * @alpha
 */
function commandInfo(evmlc, session) {
    return evmlc.command('info')
        .description('Prints information about node as JSON or --formatted.')
        .option('-f, --formatted', 'format output')
        .option('-h, --host <ip>', 'override config parameter host')
        .option('-p, --port <port>', 'override config parameter port')
        .types({
        string: ['h', 'host']
    })
        .action((args) => Staging_1.execute(exports.stage, args, session));
}
exports.default = commandInfo;
;
