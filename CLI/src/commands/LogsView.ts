import * as fs from "fs";
import * as Vorpal from "vorpal";

import Session from "../classes/Session";
import Globals from "../utils/Globals";


export default function commandLogsShow(evmlc: Vorpal, session: Session) {
    return evmlc.command('logs view').alias('l v')
        .description('Prints log information to screen in plain text.')
        .option('-s, --session', 'output session logs')
        .hidden()
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>((resolve) => {
                const interactive = session.interactive || false;
                const current = args.options.session || false;

                if (current) {
                    if (interactive) {
                        for (const log of session.logs) {
                            log.show();
                        }
                    } else {
                        Globals.warning('Cannot print session log when not in interactive mode.');
                    }
                } else {
                    Globals.info(fs.readFileSync(session.logpath, 'utf8'));
                }
                resolve();
            });
        });
};

