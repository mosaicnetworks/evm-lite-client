import * as Vorpal from "vorpal";
import * as JSONBig from 'json-bigint';
import Session from "../classes/Session";


export default function commandTest(evmlc: Vorpal, session: Session) {
    return evmlc.command('test').alias('test')
        .hidden()
        .action((args: Vorpal.Args): Promise<void> => {
            return new Promise<void>(resolve => {
                // connect(getConfig(undefined))
                //     .then((node) => {
                //         node.api.getAccount('0x6005153de588828f1ae4f3bac5129bf8ba7a82e4')
                //             .then((a) => {
                //                 console.log(JSONBig.parse(a));
                //             });
                //     })
                //     .catch();
                let string = '{"address":"0x6005153de588828f1Ae4F3BaC5129BF8BA7A82E4","balance":1337000000000000000000,"nonce":0}';
                let json = JSONBig.parse(string);
                console.log(typeof json.balance);
                console.log(json.balance.toFormat(0))
            });
        })
        .description('Testing purposes.');
};

