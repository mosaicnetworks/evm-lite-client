import * as Vorpal from "vorpal";

import {Account} from '../../../lib/index';


export default function commandTest(evmlc: Vorpal) {
    return evmlc.command('test').alias('test')
        .option('-c, --config <path>', 'set config file path')
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>(resolve => {
                let string = '/Users/danu/.evmlc/config/config.toml';
                let res = string.split('/');
                res.pop();
                let strin2 = res.join('/');

                console.log(strin2);
                resolve();
            });
        })
        .description('Testing purposes.');
};

