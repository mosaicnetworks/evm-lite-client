import * as Vorpal from "vorpal";


export default function commandGlobals(evmlc: Vorpal, config) {
    return evmlc.command('config').alias('c')
        .description('for testing purposes')
        .action((): Promise<void> => {
            return new Promise<void>(resolve => {
                console.log(config);
                resolve()
            });
        });
};