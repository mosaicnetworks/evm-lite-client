import * as path from "path";
import * as fs from "fs";

import Session from "../src/classes/Session";


export const datadir: string = path.join(__dirname, './assets');
export const session: Session = new Session(datadir);

export const pwdPath = path.join(datadir, 'pwd.txt');
export const password = fs.readFileSync(pwdPath, 'utf8');

export const otherPwdPath = path.join(datadir, 'other_pwd.txt');
export const otherPassword = fs.readFileSync(pwdPath, 'utf8');
