import * as Vorpal from "vorpal";


export default function commandConfig(evmlc: Vorpal, config) {
    return evmlc.command('config').alias('c')
        .description('Show config JSON.')
        .action((): Promise<void> => {
            return new Promise<void>(resolve => {
                console.log(config);
                resolve()
            });
        });
};