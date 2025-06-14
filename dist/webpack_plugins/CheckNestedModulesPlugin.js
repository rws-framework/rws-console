"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckNestedModulesPlugin = void 0;
const ModuleResolver_1 = require("./_CheckNestedModulesPlugin/ModuleResolver");
const chalk_1 = require("chalk");
/**
 * Webpack plugin that resolves nested dependencies and patches problematic modules
 */
class CheckNestedModulesPlugin {
    cache = {
        resolvedModules: new Map(),
        problematicModules: new Set(),
        patchedFiles: new Set()
    };
    depsList = [];
    moduleResolver;
    extraWatchedFiles = new Set();
    /**
     * Creates a new instance of the CheckNestedModulesPlugin
     * @param depsList List of dependencies to track
     * @param problematicModules List of problematic modules to handle
     */
    constructor(problematicModules = ['entities']) {
        // Convert the array to a Set for faster lookups
        this.cache.problematicModules = new Set(problematicModules);
        // Add base packages from problematicModules to the dependencies list
        const basePackages = new Set();
        problematicModules.forEach(module => {
            const packageName = module.split('/')[0];
            basePackages.add(packageName);
        });
        // Add all base packages to depsList if they're not already there
        basePackages.forEach(pkg => {
            if (!this.depsList.includes(pkg)) {
                this.depsList.push(pkg);
            }
        });
        // Initialize helper classes
        this.moduleResolver = new ModuleResolver_1.ModuleResolver(this.cache, this.depsList);
        console.log(`NestedDependencyResolverPlugin initialized with dependencies: ${this.depsList.join(', ')}`);
        if (this.cache.problematicModules.size) {
            console.log((0, chalk_1.yellow)(`Problematic modules: ${Array.from(this.cache.problematicModules).join(', ')}`));
        }
    }
    /**
     * Applies the plugin to the webpack compiler
     * @param compiler Webpack compiler instance
     */
    apply(compiler) {
        // Hook into the resolver to intercept module resolution
        compiler.hooks.normalModuleFactory.tap('NestedDependencyResolverPlugin', (factory) => {
            // Intercept the module resolution process
            factory.hooks.beforeResolve.tap('NestedDependencyResolverPlugin', (resolveData) => {
                if (!resolveData || !resolveData.request) {
                    return;
                }
                // Check if this is a dependency we want to track
                if (!this.depsList.some(dep => resolveData.request.includes(dep)) &&
                    !this.cache.problematicModules.has(resolveData.request)) {
                    return;
                }
                const issuer = resolveData.contextInfo.issuer || '';
                const nestedPath = this.moduleResolver.findNestedDependency(resolveData.request, issuer);
                if (nestedPath) {
                    // Recursively scan for all dependencies in the resolved file
                    const allDeps = Array.from(this.scanFileDeps(nestedPath));
                    console.log({ allDeps });
                    // Collect these files for extra watching
                    allDeps.forEach(depFile => this.extraWatchedFiles.add(depFile));
                    // Override the request with the nested module path
                    resolveData.request = nestedPath;
                    console.log((0, chalk_1.yellow)(`Linking "${resolveData.request}" to nested dependency at "${nestedPath}"`));
                    if (allDeps.length > 1) {
                        console.log((0, chalk_1.yellow)(`Also including recursively found dependencies:\n${allDeps.slice(1).map(f => '  - ' + f).join('\n')}`));
                    }
                }
            });
            // Hook into the resolver plugin to handle module resolution
            const resolver = compiler.resolverFactory.get('normal', {});
            if (resolver && resolver.hooks && resolver.hooks.resolve) {
                resolver.hooks.resolve.tapAsync('NestedDependencyResolverPlugin', (request, resolveContext, callback) => {
                    if (!request.request) {
                        return callback();
                    }
                    // Check if this is a dependency we want to track
                    const requestStr = request.request; // Now we know it's defined
                    if (!this.depsList.some(dep => requestStr.includes(dep)) &&
                        !this.cache.problematicModules.has(requestStr)) {
                        return callback();
                    }
                    const context = typeof request.context === 'string' ? request.context : '';
                    const nestedPath = this.moduleResolver.findNestedDependency(requestStr, context);
                    if (nestedPath) {
                        const newRequest = { ...request, request: nestedPath };
                        return resolver.doResolve(resolver.hooks.resolve, newRequest, `Resolved to nested dependency: ${nestedPath}`, resolveContext, callback);
                    }
                    return callback();
                });
            }
        });
        // Add hook to handle missing modules
        compiler.hooks.compilation.tap('NestedDependencyResolverPlugin', (compilation) => {
            // Monitor loaded modules to detect nested dependencies
            compilation.hooks.succeedModule.tap('NestedDependencyResolverPlugin', (module) => {
                if (module.request) {
                    const request = module.request;
                    const resource = module.resource;
                    // Check if this is a module we're interested in
                    if (this.depsList.some(dep => request.includes(dep))) {
                        // Register nested dependencies for this module
                        this.moduleResolver.registerNestedDependencies(resource, request);
                    }
                }
            });
            // Add extra watched files to fileDependencies for Webpack watching
            compilation.hooks.afterSeal.tap('NestedDependencyResolverPlugin', () => {
                if (compilation.fileDependencies && this.extraWatchedFiles.size) {
                    for (const file of this.extraWatchedFiles) {
                        compilation.fileDependencies.add(file);
                    }
                }
            });
        });
        compiler.hooks.done.tap('NestedDependencyResolverPlugin', (stats) => {
            console.log((0, chalk_1.green)(`NestedDependencyResolverPlugin resolved ${this.cache.resolvedModules.size} nested dependencies\n`));
            if (stats.hasErrors()) {
                const errors = stats.compilation.errors;
                // Check if there are errors related to problematic modules
                for (const problematicModule of this.cache.problematicModules) {
                    const basePackage = problematicModule.split('/')[0];
                    const moduleErrors = errors.filter((error) => error.message && error.message.includes(problematicModule));
                    if (moduleErrors.length > 0) {
                        console.warn((0, chalk_1.red)(`Found ${moduleErrors.length} errors related to ${problematicModule}: \n`));
                        moduleErrors.forEach((error) => {
                            console.error((0, chalk_1.red)(error.message));
                        });
                        console.log('\n');
                        process.exit(1);
                    }
                }
            }
        });
    }
    scanFileDeps(filePath, seen = new Set()) {
        const fs = require('fs');
        const path = require('path');
        if (!fs.existsSync(filePath) && !filePath.endsWith('.js')) {
            filePath = filePath + '.js';
        }
        if (!fs.existsSync(filePath)) {
            throw new Error((0, chalk_1.red)(`File not found: ${filePath}`));
        }
        ;
        if (!seen.has(filePath)) {
            seen.add(filePath);
        }
        console.log((0, chalk_1.yellow)(`[scanFileDeps] Scanning: ${filePath}`));
        const content = fs.readFileSync(filePath, 'utf-8');
        // Simple regex for require/import (does not cover all cases)
        const requireRegex = /require\(['"]([^'"\)]+)['"]\)/g;
        const importRegex = /import\s+(?:.*?\s+from\s+)?['"]([^'"\)]+)['"]/g;
        let match;
        const deps = [];
        while ((match = requireRegex.exec(content)))
            deps.push(match[1]);
        while ((match = importRegex.exec(content)))
            deps.push(match[1]);
        for (const dep of deps) {
            let depPath = null;
            let isProblematicModuleFile = false;
            if (dep.startsWith('.') || dep.startsWith('/')) {
                depPath = path.resolve(path.dirname(filePath), dep);
                if (!fs.existsSync(depPath) && !depPath.endsWith('.js') && fs.existsSync(depPath + '.js')) {
                    depPath += '.js';
                }
                // If the resolved file is inside any problematic module directory, always add and scan
                for (const problematicModule of this.cache.problematicModules) {
                    const baseDir = path.sep + 'node_modules' + path.sep + problematicModule.split('/')[0] + path.sep;
                    if (depPath.includes(baseDir)) {
                        if (!seen.has(depPath) && fs.existsSync(depPath)) {
                            seen.add(depPath);
                            this.scanFileDeps(depPath, seen);
                        }
                        // Do not process further for this dep
                        depPath = null;
                        break;
                    }
                }
            }
            if (depPath) {
                if (this.depsList.some(d => dep.includes(d)) ||
                    this.cache.problematicModules.has(dep)) {
                    depPath = this.moduleResolver.findNestedDependency(dep, path.dirname(filePath));
                }
                if (depPath && !seen.has(depPath) && fs.existsSync(depPath)) {
                    seen.add(depPath);
                    this.scanFileDeps(depPath, seen);
                }
            }
        }
        return seen;
    }
}
exports.CheckNestedModulesPlugin = CheckNestedModulesPlugin;
//# sourceMappingURL=CheckNestedModulesPlugin.js.map