import * as Vorpal from "vorpal";


export default function commandInteractive(evmlc: Vorpal) {
    return evmlc.command('interactive').alias('i')
        .option('-c, --config <path>', 'set config file path')
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>(resolve => resolve());
        })
        .description('Enter interactive mode.');
};