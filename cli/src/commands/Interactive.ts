import * as Vorpal from "vorpal";


export default function commandInteractive(evmlc: Vorpal, config) {
    return evmlc.command('interactive').alias('i')
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>(resolve => resolve());
        })
        .description('Enter interactive mode.');
};