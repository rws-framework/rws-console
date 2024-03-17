import { Command, OptionValues } from 'commander';
import { IRWSCliActionType } from './_managed_console';
export interface IOutputOpts {
    command: string;
    args: string[];
    moduleCfgDir: string;
    webpackPath: string;
    totalMemoryMB: number;
    totalMemoryGB: number;
    program: Command;
    options: OptionValues;
}
type OptionType = string | boolean | string[];
export type RWSInputOptsType<T extends OptionType = OptionType> = {
    short?: string;
    long: string;
    desc?: string;
    defaultValue: T;
}[];
export type RWSInputArgsType = {
    short?: string;
    long: string;
    desc?: string;
}[];
export type RWSInputType = {
    options?: RWSInputOptsType;
    args?: RWSInputArgsType;
};
declare const runCmd: (action: Promise<IRWSCliActionType>, argsOpts?: RWSInputType) => Promise<Command>;
export default runCmd;
