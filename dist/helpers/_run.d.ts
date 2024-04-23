import { Command, OptionValues } from 'commander';
import { IRWSCliActionType } from './_managed_console';
export interface IOutputOpts {
    command: string;
    args: {
        [key: string]: string;
    };
    moduleCfgDir: string;
    webpackPath: string;
    totalMemoryMB: number;
    totalMemoryGB: number;
    program: Command;
    options: OptionValues;
    rawArgs: string[];
}
type OptionType = string | boolean | string[];
export type RWSInputOptsType<T extends OptionType = OptionType> = {
    short?: string;
    long: string;
    desc?: string;
    defaultValue: T;
    parseArg?: (value: string, previous: T) => T;
}[];
export type RWSInputArgsType = string[];
export type RWSInputType = {
    proxy?: boolean;
    options?: RWSInputOptsType;
    args?: RWSInputArgsType;
};
declare const runCmd: (action: Promise<IRWSCliActionType>, argsOpts?: RWSInputType) => Promise<Command>;
export default runCmd;
