import * as Vorpal from "vorpal";

import Staging, {execute, Message, StagedOutput, StagingFunction} from "../classes/Staging";

import Session from "../classes/Session";

export const stage: StagingFunction = (args: Vorpal.Args, session: Session): Promise<StagedOutput<Message>> => {
    return new Promise<StagedOutput<Message>>((resolve) => {
        let {error, success} = Staging.getStagingFunctions(args);

        let message: string = `Config file location: ${session.config.path} \n\n` + session.config.toTOML();
        resolve(success(message))
    });
};

export default function commandConfigUser(evmlc: Vorpal, session: Session) {

    let description =
        'Output current configuration file as JSON.';

    return evmlc.command('config view').alias('c v')
        .description(description)
        .action((args: Vorpal.Args): Promise<void> => execute(stage, args, session));

};