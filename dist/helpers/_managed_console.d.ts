/// <reference types="node" />
import * as readline from 'readline';
import getArgs from '../helpers/_args';
declare class RWSManagedConsole {
    static _askForYn(question: string, rl?: readline.Interface): Promise<boolean>;
    static _askFor<T>(question: string, defaultVal?: T | null, parser?: (txt: string) => T, yN?: boolean): Promise<T | null>;
}
export { RWSManagedConsole, getArgs };
