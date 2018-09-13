"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
const util = require("util");
const prompt = require("prompt");
prompt.start();
prompt.message = '';
prompt.delimiter = '';

/**
 *
 * @module
 */
function parseInputs(input) {
    let type;
    switch (input) {
        case 'address':
            return 'string';
    }
    if (input.toLowerCase().includes('int')) {
        return 'number';
    }
}

exports.parseInputs = parseInputs;
/**
 * Console Colours
 */
const fgRed = '\x1b[31m';
exports.fgRed = fgRed;
const fgGreen = '\x1b[32m';
exports.fgGreen = fgGreen;
const fgBlue = '\x1b[34m';
exports.fgBlue = fgBlue;
const fgMagenta = '\x1b[35m';
exports.fgMagenta = fgMagenta;
const fgCyan = '\x1b[36m';
exports.fgCyan = fgCyan;
const fgWhite = '\x1b[37m';
exports.fgWhite = fgWhite;
/**
 * Logs a message with a defined colour to the console.
 *
 * @param color
 * @param text
 */
exports.log = (color, text) => {
    console.log(color + text + '\x1b[0m');
};
/**
 * Waits for user to press any key.
 *
 * @param message
 */
exports.step = (message) => {
    exports.log(fgWhite, '\n' + message);
    return new Promise((resolve) => {
        prompt.get('PRESS ENTER TO CONTINUE', function () {
            resolve();
        });
    });
};
/**
 * Explains an action and logs it to console.
 *
 * @param message
 */
exports.explain = (message) => {
    exports.log(fgCyan, util.format('\nEXPLANATION:\n%s', message));
};
/**
 * Adds a new line.
 */
exports.space = () => {
    console.log('\n');
};
/**
 * Sleeps for `time`.
 *
 * @param time
 */
exports.sleep = (time) => {
    return new Promise((resolve) => setTimeout(resolve, time));
};
