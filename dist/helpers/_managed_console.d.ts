import * as readline from 'readline';
import { Command } from 'commander';
import { IOutputOpts, RWSInputType } from './_run';
export declare const RWSManagedConsole: {
    _askForYn: (question: string, rl?: readline.Interface) => Promise<boolean>;
    _askFor: <T>(question: string, defaultVal?: T | null, parser?: (...args: any[]) => T, yN?: boolean) => Promise<T | null>;
};
export type IRWSCliActionType = (inputOpts: IOutputOpts) => Promise<Command>;
export type IRWSCliActionsType = {
    [key: string]: IRWSCliActionType;
};
export declare function loadAction(actionName: string, actionsDir: string): Promise<IRWSCliActionType>;
export declare class RWSCliBootstrap {
    private actions;
    private actionsDir;
    constructor(actions: Record<string, Promise<IRWSCliActionType>>, actionsDir: string);
    run(runOpts: RWSInputType): Promise<Command>;
}
export declare function bootstrap(actions: string[], actionsDir: string): RWSCliBootstrap;
