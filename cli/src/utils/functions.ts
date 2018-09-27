import * as Chalk from "chalk";

const l = console.log;
const chalk = Chalk.default;

export const success = (message: any): void => l(chalk.green(message));
export const warning = (message: any): void => l(chalk.yellow(message));
export const error = (message: any): void => l(chalk.red(message));
export const info = (message: any): void => l(chalk.blue(message));
