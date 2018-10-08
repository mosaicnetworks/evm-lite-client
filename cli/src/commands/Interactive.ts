import * as Vorpal from "vorpal";

import UserConfig from "../classes/UserConfig";


export default function commandInteractive(evmlc: Vorpal, config: UserConfig) {
    return evmlc.command('interactive').alias('i')
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>(resolve => resolve());
        })
        .description('Enter interactive mode.');
};