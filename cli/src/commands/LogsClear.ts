import * as fs from "fs";
import * as Vorpal from "vorpal";

import Session from "../classes/Session";
import Globals from "../utils/Globals";


export default function commandLogsClear(evmlc: Vorpal, session: Session) {
    return evmlc.command('logs clear').alias('l c')
        .description('Clears log information.')
        .hidden()
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>((resolve) => {
                fs.writeFileSync(session.logpath, '');
                Globals.success('Logs cleared.');
                resolve();
            });
        });
};

