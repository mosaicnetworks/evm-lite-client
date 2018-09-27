"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
const Chalk = require("chalk");
const l = console.log;
const chalk = Chalk.default;
exports.success = (message) => l(chalk.green(message));
exports.warning = (message) => l(chalk.yellow(message));
exports.error = (message) => l(chalk.red(message));
exports.info = (message) => l(chalk.blue(message));
