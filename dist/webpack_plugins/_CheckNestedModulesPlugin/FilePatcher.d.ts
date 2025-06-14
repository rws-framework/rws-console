import { ModuleCache } from './types';
/**
 * Handles patching of files with problematic imports
 */
export declare class FilePatcher {
    private cache;
    constructor(cache: ModuleCache);
}
