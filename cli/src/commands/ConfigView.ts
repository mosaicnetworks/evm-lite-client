import * as Vorpal from "vorpal";

import {getConfig} from "../utils/globals";

import Config from "../classes/Config";


/**
 * Should return a Vorpal command instance used for viewing the config file.
 *
 * @param {Vorpal} evmlc - The command line object.
 * @returns Vorpal Command instance
 */

export default function commandConfigUser(evmlc: Vorpal) {

    return evmlc.command('config view').alias('c v')
        .description('View config file.')
        .option('-c, --config <path>', 'set config file path')
        .types({
            string: ['config']
        })
        .action((args: Vorpal.Args): Promise<void> => {

            return new Promise<void>(resolve => {
                let config: Config = getConfig(args.options.config);

                console.log(config.data);
                resolve();
            });

        });

};