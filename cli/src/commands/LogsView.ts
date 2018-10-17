import * as Vorpal from "vorpal";
import * as fs from "fs";

import Globals from "../utils/Globals";
import Session from "../classes/Session";


export default function commandLogsShow(evmlc: Vorpal, session: Session) {
    return evmlc.command('logs view').alias('l v')
        .description('Prints log information to screen in plain text.')
        .option('-s, --session', 'output session logs')
        .hidden()
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>((resolve) => {
                try {
                    let interactive = session.interactive || false;
                    let current = args.options.session || false;

                    if (current) {
                        if (interactive) {
                            for (let log of session.logs) {
                                log.show();
                            }
                        } else {
                            Globals.warning('Cannot print session log when not in interactive mode.');
                        }
                    } else {
                        Globals.info(fs.readFileSync(session.logpath, 'utf8'));
                    }
                } catch (err) {
                    (typeof err === 'object') ? console.log(err) : Globals.error(err);
                }
                resolve();
            });
        });
};

