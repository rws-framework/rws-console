import os from 'os';
import path from 'path';
import { findRootWorkspacePath } from '../tools/path';

export interface IOutputArgs {
    command: string;
    args: string[];
    moduleCfgDir: string;
    webpackPath: string;
    packageRootDir: string;
    totalMemoryMB: number;
    totalMemoryGB: number;
}

export default (procArgs: string[]): IOutputArgs =>  {
    let command2map = procArgs[2];
    let args: string | string[] = procArgs[3] || '';

    const extraArgsAggregated: string[] = [];

    if (process.argv.length > 4) {
        for (let i = 4; i <= process.argv.length - 1; i++) {
            extraArgsAggregated.push(process.argv[i]);
        }
    }

    const totalMemoryBytes = os.totalmem();
    const totalMemoryKB = totalMemoryBytes / 1024;
    const totalMemoryMB = totalMemoryKB / 1024;
    const totalMemoryGB = totalMemoryMB / 1024;

    const webpackPath = path.resolve(__dirname, '..');

    const packageRootDir = findRootWorkspacePath(process.cwd());
    const moduleCfgDir = `${packageRootDir}/node_modules/.rws`;

    if (!command2map) {
        command2map = 'init';
    }

    if (args && extraArgsAggregated.length) {
        args = [args, ...extraArgsAggregated];
    } else if (args && typeof args === 'string') {
        args = [args];
    }

    return {
        command: command2map,
        args: args as string[],
        moduleCfgDir,
        webpackPath,
        packageRootDir,
        totalMemoryMB,
        totalMemoryGB
    };
};