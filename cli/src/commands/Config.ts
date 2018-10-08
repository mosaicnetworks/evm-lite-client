import * as Vorpal from "vorpal";

import UserConfig from "../utils/UserConfig";


export default function commandConfig(evmlc: Vorpal, config: UserConfig) {
    return evmlc.command('config').alias('c')
        .description('Show config JSON.')
        .action((): Promise<void> => {
            return new Promise<void>(resolve => {
                console.log(config.data);
                resolve()
            });
        });
};