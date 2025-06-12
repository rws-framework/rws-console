import { NormalModule } from 'webpack';
import { ModuleCache } from './types';
/**
 * Handles patching of files with problematic imports
 */
export declare class FilePatcher {
    private cache;
    constructor(cache: ModuleCache);
    /**
     * Patches hardcoded imports in a module
     * @param module Module to patch
     */
    patchHardcodedImports(module: NormalModule): void;
    /**
     * Checks and patches parse5 files
     * @param module Module to check and patch
     */
    checkAndPatchParse5(module: NormalModule): void;
}
