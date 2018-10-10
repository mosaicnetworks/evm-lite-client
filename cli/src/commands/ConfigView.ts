import * as Vorpal from "vorpal";

import Session from "../classes/Session";


export default function commandConfigUser(evmlc: Vorpal, session: Session) {

    let description =
        'Output current configuration file as JSON.';

    return evmlc.command('config view').alias('c v')
        .description(description)
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>(resolve => {
                console.log(session.config.data);
                resolve();
            });
        });

};