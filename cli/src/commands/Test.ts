import * as Vorpal from "vorpal";

import {Account} from '../../../lib/index';


export default function template(evmlc: Vorpal, config) {
    return evmlc.command('test').alias('test')
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>(resolve => resolve());
        })
        .description('Testing purposes.');
};

