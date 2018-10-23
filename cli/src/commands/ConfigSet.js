"use strict";
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
exports.stage = (args, session) => {
    return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
        let { error, success } = Staging_1.default.getStagingFunctions(args);
        let interactive = args.options.interactive || session.interactive;
        let questions = [];
        function populateQuestions(object) {
            for (let key in object) {
                if (object.hasOwnProperty(key)) {
                    if (typeof object[key] === 'object') {
                        populateQuestions(object[key]);
                    }
                    else {
                        questions.push({
                            name: key,
                            default: object[key],
                            type: 'input',
                            message: `${key.charAt(0).toUpperCase() + key.slice(1)}: `
                        });
                    }
                }
            }
        }
        populateQuestions(session.config.data);
        if (interactive) {
            let answers = yield inquirer.prompt(questions);
            for (let key in answers) {
                if (answers.hasOwnProperty(key)) {
                    args.options[key.toLowerCase()] = answers[key];
                }
            }
        }
        if (!Object.keys(args.options).length) {
            resolve(error(Staging_1.default.ERRORS.BLANK_FIELD, 'No options provided. To enter interactive mode use: -i, --interactive.'));
            return;
        }
        for (let key in args.options) {
            if (args.options.hasOwnProperty(key)) {
                if (session.config.data.defaults[key] !== args.options[key] && key !== 'interactive') {
                    session.config.data.defaults[key] = args.options[key];
                }
            }
        }
        resolve(success(session.config.save() ? 'Configuration saved.' : 'No changes detected.'));
    }));
};
function commandConfigSet(evmlc, session) {
    let description = 'Set values of the configuration inside the data directory.';
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
