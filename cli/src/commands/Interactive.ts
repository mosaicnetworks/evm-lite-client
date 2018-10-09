import * as Vorpal from "vorpal";


export default function commandInteractive(evmlc: Vorpal) {

    let description =
        `Enter into interactive mode with default configuration or the one provided with -c, --config.`;

    return evmlc.command('interactive').alias('i')
        .description(description)
        .option('-c, --config <path>', 'set config file path')
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>(resolve => resolve());
        });
};