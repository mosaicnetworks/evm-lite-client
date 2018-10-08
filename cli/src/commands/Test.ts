import * as Vorpal from "vorpal";

import {Account} from '../../../lib/index';
import {isEquivalentObjects} from "../utils/functions";

import UserConfig from "../classes/UserConfig";


export default function commandTest(evmlc: Vorpal, config: UserConfig) {
    return evmlc.command('test').alias('test')
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>(resolve => {
                let A = {
                    hello: 'hello',
                    danu: {
                        asd: 1,
                        asd1: 2,
                        danu1: {
                            cc: 1,
                            ss: 22
                        }

                    }
                };

                let B = {
                    hello: 'hello',
                    danu: {
                        asd: 1,
                        asd1: 2,
                        danu1: {
                            cc: 1,
                            ss: 2
                        }
                    }
                };

                console.log(isEquivalentObjects(A, B));
                resolve();
            });
        })
        .description('Testing purposes.');
};

