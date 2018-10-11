import * as Vorpal from "vorpal";

import Session from "../classes/Session";


export default function commandTest(evmlc: Vorpal, session: Session) {
    return evmlc.command('test').alias('test')
        .hidden()
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>(resolve => {
            });
        })
        .description('Testing purposes.');
};

