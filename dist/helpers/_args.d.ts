import { Command } from 'commander';
export interface IOutputArgs {
    command: string;
    args: string[];
    moduleCfgDir: string;
    webpackPath: string;
    packageRootDir: string;
    totalMemoryMB: number;
    totalMemoryGB: number;
    program: Command;
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
declare const runCmd: (argsOpts?: RWSInputType) => IOutputArgs;
export default runCmd;
