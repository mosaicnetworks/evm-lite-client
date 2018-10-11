import * as Vorpal from "vorpal";

import {error, success} from "../utils/globals";

import Session from "../classes/Session";


export default function commandConfigUser(evmlc: Vorpal, session: Session) {

    let description =
        'Output current configuration file as JSON.';

    return evmlc.command('config view').alias('c v')
        .description(description)
        .action((): Promise<void> => {
            return new Promise<void>(resolve => {
                try {
                    success(session.config.toTOML());
                } catch (err) {
                    (typeof err === 'object') ? console.log(err) : error(err);
                }
                resolve();
            });
        });

};