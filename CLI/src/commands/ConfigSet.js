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
const inquirer = require("inquirer");
const Staging_1 = require("../classes/Staging");
/**
 * Should return either a Staged error or success.
 *
 * @remarks
 * This staging function will parse all the arguments of the `config set` command
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
        const interactive = args.options.interactive || session.interactive;
        const questions = [];
        function populateQuestions(object) {
            for (const key in object) {
                if (object.hasOwnProperty(key)) {
                    if (typeof object[key] === 'object') {
                        populateQuestions(object[key]);
                    }
                    else {
                        questions.push({
                            default: object[key],
                            message: `${key.charAt(0).toUpperCase() + key.slice(1)}: `,
                            name: key,
                            type: 'input',
                        });
                    }
                }
            }
        }
        populateQuestions(session.config.data);
        if (interactive) {
            const answers = yield inquirer.prompt(questions);
            for (const key in answers) {
                if (answers.hasOwnProperty(key)) {
                    args.options[key.toLowerCase()] = answers[key];
                }
            }
        }
        if (!Object.keys(args.options).length) {
            resolve(error(Staging_1.default.ERRORS.BLANK_FIELD, 'No options provided.'));
            return;
        }
        for (const key in args.options) {
            if (args.options.hasOwnProperty(key)) {
                if (session.config.data.defaults[key] !== args.options[key] && key !== 'interactive') {
                    session.config.data.defaults[key] = args.options[key];
                }
            }
        }
        const saved = yield session.config.save();
        resolve(success(saved ? 'Configuration saved.' : 'No changes detected.'));
    }));
};
/**
 * Should construct a Vorpal.Command instance for the command `config set`.
 *
 * @remarks
 * Allows you to set EVM-Lite CLI configuration settings through the CLI. Can be done interactively.
 *
 * Usage: `config set --host 5.5.5.1`
 *
 * Here we have executed a command to change the default host to connect to for any command
 * through the CLI to `5.5.5.1`.
 *
 * @param evmlc - The CLI instance.
 * @param session - Controls the session of the CLI instance.
 * @returns The Vorpal.Command instance of `accounts get`.
 *
 * @alpha
 */
function commandConfigSet(evmlc, session) {
    const description = 'Set values of the configuration inside the data directory.';
    return evmlc.command('config set').alias('c s')
        .description(description)
        .option('-i, --interactive', 'enter into interactive command')
        .option('-h, --host <host>', 'default host')
        .option('-p, --port <port>', 'default port')
        .option('--from <from>', 'default from')
        .option('--gas <gas>', 'default gas')
        .option('--gasPrice <gasprice>', 'gas price')
        .option('--keystore <path>', 'keystore path')
        .option('--pwd <path>', 'password path')
        .types({
        string: ['h', 'host', 'from', 'keystore', 'pwd']
    })
        .action((args) => Staging_1.execute(exports.stage, args, session));
}
exports.default = commandConfigSet;
;
