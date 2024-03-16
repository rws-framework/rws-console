import * as readline from 'readline';
import chalk from 'chalk';
import getArgs from '../helpers/_args';

class RWSManagedConsole {
    static async _askForYn(question: string, rl?: readline.Interface): Promise<boolean> {
        return new Promise((yNResolve) => {
            if (!rl) {
                rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout,
                });
            }

            rl.question(question + ' (y/n): ', (answer) => {
                if (answer === 'y') {
                    yNResolve(true); // Resolved positively
                } else {
                    yNResolve(false); // Immediate resolve for "no" answer

                    if(rl){
                        rl.close();
                    }                    
                }
            });
        });
    }

    static async _askFor<T>(
        question: string,
        defaultVal: T | null = null,
        parser: (txt: string) => T = (txt) => txt as unknown as T,
        yN = true
    ): Promise<T | null> {
        return new Promise((resolve) => {
            (async () => {
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout,
                });
    
                const questionAsked = () => {
                    rl.question(question + ': ', (answer) => {
                        resolve(parser(answer));
                        rl.close();
                    });
                };
    
                if (yN) {
                    const ynResult = await this._askForYn('Do you want to set "' + question + '"?', rl);
    
                    if (!ynResult) {
                        console.log(chalk.red('Canceled'));
                        rl.close();
                        resolve(defaultVal);
                        return;
                    }
                }
    
                questionAsked();
            })();
        });
    }
}

export { RWSManagedConsole, getArgs };