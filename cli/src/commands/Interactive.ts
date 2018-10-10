import * as Vorpal from "vorpal";
import Session from "../classes/Session";


export default function commandInteractive(evmlc: Vorpal, session: Session) {

    let description =
        'Enter into interactive mode with data directory provided by --datadir, -d.';

    return evmlc.command('interactive').alias('i')
        .description(description)
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>(resolve => resolve());
        });
};