export interface IOutputArgs {
    command: string;
    args: string[];
    moduleCfgDir: string;
    webpackPath: string;
    packageRootDir: string;
    totalMemoryMB: number;
    totalMemoryGB: number;
}
declare const _default: (procArgs: string[]) => IOutputArgs;
export default _default;
