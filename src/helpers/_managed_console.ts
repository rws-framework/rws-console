import * as readline from 'readline';
import chalk from 'chalk';

import path from 'path';
import { Command } from 'commander';
import runCmd, { IOutputOpts, RWSInputOptsType, RWSInputType } from './_run'

export const RWSManagedConsole =  {
    _askForYn: async function (question: string, rl?: readline.Interface): Promise<boolean> {
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
    },
    _askFor: async function<T>(
        question: string,
        defaultVal: T | null = null,
        parser: (...args: any[]) => T = (...args: any[]) => args[0],
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
                    const ynResult = await RWSManagedConsole._askForYn('Do you want to set "' + question + '"?', rl);
    
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

export type IRWSCliActionType = (inputOpts: IOutputOpts) => Promise<Command>;
export type IRWSCliActionsType = {[key: string] : IRWSCliActionType};

export async function loadAction(actionName: string, actionsDir: string): Promise<IRWSCliActionType> 
{
    return (await import(path.resolve(`${actionsDir}/${actionName}Action.js`))).default;
}

export class RWSCliBootstrap { 
    constructor(private actions: Record<string,Promise<IRWSCliActionType>>, private actionsDir: string){}

    async run(runOpts: RWSInputType): Promise<Command>
    {                                
        if(!Object.keys(this.actions).includes(`${process.argv[2]}`) && !runOpts.proxy){
            console.error(`No command executor "${process.argv[2]}" is defined`);
            return;
        }
        
        return await runCmd(this.actions[runOpts.proxy ? 'proxy' : process.argv[2]], runOpts);
    }
}

export function bootstrap(actions: string[], actionsDir: string): RWSCliBootstrap
{
    if(!actionsDir || !actions || !actions.length){
        console.trace(chalk.red('Bootstrap needs "actions" string array (at least one defined), and "actionsDir" (string path) parameters'));
        return;
    }

    const actionsToLoad: {[key: string] : Promise<IRWSCliActionType>} = {};

    actions.forEach((act: string) => {        
        actionsToLoad[act] = loadAction(act, actionsDir);
    });        

    return new RWSCliBootstrap(actionsToLoad, actionsDir);
}