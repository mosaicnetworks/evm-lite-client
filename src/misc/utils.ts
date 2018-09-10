import * as util from 'util';
import * as prompt from 'prompt';

prompt.start();
prompt.message = '';
prompt.delimiter = '';

/**
 *
 * @module
 */
export function parseInputs(input: string) {
    let type: string;
    switch (input) {
        case 'address':
            return 'string';
    }
    if (input.toLowerCase().includes('int')) {
        return 'number';
    }
}

/**
 * Console Colours
 */
const fgRed = '\x1b[31m';
const fgGreen = '\x1b[32m';
const fgBlue = '\x1b[34m';
const fgMagenta = '\x1b[35m';
const fgCyan = '\x1b[36m';
const fgWhite = '\x1b[37m';

export {
    fgRed,
    fgGreen,
    fgBlue,
    fgMagenta,
    fgCyan,
    fgWhite,
}

/**
 * Logs a message with a defined colour to the console.
 *
 * @param color
 * @param text
 */
export const log = (color: string, text: string) => {
    console.log(color + text + '\x1b[0m');
};


/**
 * Waits for user to press any key.
 *
 * @param message
 */
export const step = (message: string) => {
    log(fgWhite, '\n' + message);
    return new Promise((resolve) => {
        prompt.get('PRESS ENTER TO CONTINUE', function () {
            resolve();
        });
    })
};

/**
 * Explains an action and logs it to console.
 *
 * @param message
 */
export const explain = (message: string) => {
    log(fgCyan, util.format('\nEXPLANATION:\n%s', message))
};

/**
 * Adds a new line.
 */
export let space = () => {
    console.log('\n');
};

/**
 * Sleeps for `time`.
 *
 * @param time
 */
export const sleep = (time: number) => {
    return new Promise((resolve) => setTimeout(resolve, time));
};