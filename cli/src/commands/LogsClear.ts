import * as Vorpal from "vorpal";
import * as fs from "fs";

import Globals from "../utils/Globals";
import Session from "../classes/Session";


export default function commandLogsClear(evmlc: Vorpal, session: Session) {
    return evmlc.command('logs clear').alias('l c')
        .description('Clears log information.')
        .hidden()
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>((resolve) => {
                try {
                    fs.writeFileSync(session.logpath, '');
                    Globals.success('Logs cleared.');
                } catch (err) {
                    (typeof err === 'object') ? console.log(err) : Globals.error(err);
                }
                resolve();
            });
        });
};

