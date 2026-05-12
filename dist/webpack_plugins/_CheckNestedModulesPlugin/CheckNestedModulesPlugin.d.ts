import { Compiler } from 'webpack';
/**
 * Webpack plugin that resolves nested dependencies and patches problematic modules
 */
export declare class CheckNestedModulesPlugin {
    private cache;
    private depsList;
    private moduleResolver;
    private filePatcher;
    /**
     * Creates a new instance of the CheckNestedModulesPlugin
     * @param depsList List of dependencies to track
     * @param problematicModules List of problematic modules to handle
     */
    constructor(depsList?: string[], problematicModules?: string[]);
    /**
     * Applies the plugin to the webpack compiler
     * @param compiler Webpack compiler instance
     */
    apply(compiler: Compiler): void;
}
