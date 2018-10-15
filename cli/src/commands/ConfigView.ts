import * as Vorpal from "vorpal";

import Globals from "../utils/Globals";
import Session from "../classes/Session";


export default function commandConfigUser(evmlc: Vorpal, session: Session) {

    let description =
        'Output current configuration file as JSON.';

    return evmlc.command('config view').alias('c v')
        .description(description)
        .action((): Promise<void> => {
            return new Promise<void>(resolve => {
                try {
                    Globals.info(`Config file location: ${session.config.path}`);
                    Globals.success(session.config.toTOML());
                } catch (err) {
                    (typeof err === 'object') ? console.log(err) : Globals.error(err);
                }
                resolve();
            });
        });

};