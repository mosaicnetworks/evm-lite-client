import * as util from 'util';
import * as prompt from 'prompt';


export default class Utils {
    static fgRed: string = '\x1b[31m';
    static fgGreen: string = '\x1b[32m';
    static fgBlue: string = '\x1b[34m';
    static fgMagenta: string = '\x1b[35m';
    static fgCyan: string = '\x1b[36m';
    static fgWhite: string = '\x1b[37m';

    constructor() {
    }

    static log(color: string, text: string) {
        console.log(color + text + '\x1b[0m');
    }

    static step(message: string) {
        Utils.log(Utils.fgWhite, '\n' + message);
        return new Promise((resolve) => {
            prompt.get('PRESS ENTER TO CONTINUE', function () {
                resolve();
            });
        })
    }

    static explain(message: string) {
        Utils.log(Utils.fgCyan, util.format('\nEXPLANATION:\n%s', message))
    }

    static space() {
        console.log('\n');
    }

    static sleep(time: number) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }
}