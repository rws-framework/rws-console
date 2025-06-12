import { Compiler } from 'webpack';
export declare class CheckNestedModulesPlugin {
    private depsList;
    private resolvedModules;
    private problematicModules;
    private patchedFiles;
    constructor(depsList?: string[], problematicModules?: string[]);
    private readJSONFile;
    private findNestedProblemModule;
    private findNestedDependency;
    private patchHardcodedImports;
    private checkAndPatchParse5;
    apply(compiler: Compiler): void;
}
