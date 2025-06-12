import { ModuleCache } from './types';
/**
 * Handles module resolution for nested dependencies
 */
export declare class ModuleResolver {
    private cache;
    private depsList;
    constructor(cache: ModuleCache, depsList: string[]);
    /**
     * Finds a nested problematic module
     * @param request Module request
     * @param issuer Issuer path
     * @returns Path to the nested module or null if not found
     */
    findNestedProblemModule(request: string, issuer: string): string | null;
    /**
     * Finds a nested dependency
     * @param request Module request
     * @param issuer Issuer path
     * @returns Path to the nested dependency or null if not found
     */
    findNestedDependency(request: string, issuer: string): string | null;
    /**
     * Registers nested dependencies for a module
     * @param module Module resource path
     * @param request Module request
     */
    registerNestedDependencies(module: string, request: string): void;
}
