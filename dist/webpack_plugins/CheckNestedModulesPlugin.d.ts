/**
 * Webpack plugin that resolves nested dependencies and patches problematic modules
 */
export declare class CheckNestedModulesPlugin {
    private cache;
    private depsList;
    private moduleResolver;
    private extraWatchedFiles;
    /**
     * Creates a new instance of the CheckNestedModulesPlugin
     * @param depsList List of dependencies to track
     * @param problematicModules List of problematic modules to handle
     */
    constructor(problematicModules?: string[]);
    /**
     * Applies the plugin to the webpack compiler
     * @param compiler Webpack compiler instance
     */
    apply(compiler: any): void;
    private scanFileDeps;
}
