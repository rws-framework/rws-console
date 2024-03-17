import { Command, OptionValues, program as cmdFactory } from 'commander';
import os from 'os';
import path from 'path';
import { findRootWorkspacePath } from '../tools/path';
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

export type RWSInputOptsType<T extends OptionType = OptionType> = { short?: string, long: string, desc?: string, defaultValue: T}[];
export type RWSInputArgsType = string[];

export type RWSInputType = { options?: RWSInputOptsType, args?: RWSInputArgsType };

const runCmd = async (action: Promise<IRWSCliActionType>, argsOpts: RWSInputType = {}): Promise<Command> => {     
    const program = cmdFactory;          
    const programCommand = program.command(`${process.argv[2]} ${(argsOpts?.args?.map(it => `<${it}>`) || []).join(' ')}`) // Capture variadic arguments for the command

    for(const opt of argsOpts?.options || []){
        programCommand.option(`-${opt.short}, --${opt.long} <opt-value>`, opt.desc);
    }

    for(const opt of argsOpts?.args || []){
        //args
    }

    const options: OptionValues = {};        
    
    let args: string[];    

    const totalMemoryBytes = os.totalmem();
    const totalMemoryMB = totalMemoryBytes / 1024 / 1024;
    const totalMemoryGB = totalMemoryMB / 1024;

    let webpackPath;    
    let moduleCfgDir;

    const parsedOpts: IOutputOpts = {
        command: process.argv[2],
        program,
        args: args,
        moduleCfgDir,
        webpackPath,        
        totalMemoryMB,
        totalMemoryGB,
        options
    };    

    programCommand.action(async (...actionArgs) => {              

        parsedOpts.webpackPath = path.resolve(__dirname, '..');        
        parsedOpts.moduleCfgDir = `${findRootWorkspacePath(process.cwd())}/node_modules/.rws`;
        parsedOpts.options = programCommand.opts()
        parsedOpts.args = actionArgs.filter((v: string, index: number) => (index < actionArgs.length - 1) && typeof v === 'string') || []         
       
    })    

    program.parse(process.argv);


    return (await action)(parsedOpts);
};

export default runCmd;