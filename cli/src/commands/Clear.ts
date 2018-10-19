import * as Vorpal from "vorpal";

import Session from "../classes/Session";


export default function commandClear(evmlc: Vorpal, session: Session) {
    return evmlc.command('clear')
        .description('Clears interactive mode output output.')
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>((resolve) => {
                process.stdout.write("\u001B[2J\u001B[0;0f");
                resolve();
            });
        });
};

