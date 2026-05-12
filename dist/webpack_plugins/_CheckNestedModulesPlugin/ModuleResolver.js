"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleResolver = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const utils_1 = require("./utils");
/**
 * Handles module resolution for nested dependencies
 */
class ModuleResolver {
    cache;
    depsList;
    constructor(cache, depsList) {
        this.cache = cache;
        this.depsList = depsList;
    }
    /**
     * Finds a nested problematic module
     * @param request Module request
     * @param issuer Issuer path
     * @returns Path to the nested module or null if not found
     */
    findNestedProblemModule(request, issuer) {
        if (!this.cache.problematicModules.has(request)) {
            return null;
        }
        // Find the module that imports the problematic module
        const parts = request.split('/');
        const packageName = parts[0]; // e.g., 'entities'
        const subModule = parts.slice(1).join('/'); // e.g., 'decode' or 'escape'
        // Find the package directory that contains the issuer
        const issuerPackageDir = (0, utils_1.getPackageDir)(issuer);
        if (!issuerPackageDir)
            return null;
        // Look for the problematic module in the issuer's node_modules
        const modulePath = path.join(issuerPackageDir, 'node_modules', packageName);
        if (fs.existsSync(modulePath)) {
            console.log(`Found module ${packageName} at ${modulePath} for request ${request} from ${issuer}`);
            // Check various possible locations for the submodule
            const possiblePaths = (0, utils_1.getPossibleSubmodulePaths)(modulePath, subModule);
            for (const possiblePath of possiblePaths) {
                if (fs.existsSync(possiblePath)) {
                    console.log(`Found nested submodule at ${possiblePath}`);
                    return possiblePath;
                }
            }
            // Check if the submodule.js file is a redirect file
            const directSubmodulePath = path.join(modulePath, `${subModule}.js`);
            if (fs.existsSync(directSubmodulePath)) {
                try {
                    const content = fs.readFileSync(directSubmodulePath, 'utf-8');
                    // Check if the file contains a redirect to another file
                    const requireMatch = content.match(/require\(['"](.+)['"]\)/);
                    if (requireMatch && requireMatch[1]) {
                        const targetPath = requireMatch[1];
                        const resolvedTargetPath = path.join(modulePath, targetPath);
                        // Check if the target path exists
                        if (fs.existsSync(resolvedTargetPath)) {
                            console.log(`Found redirected submodule at ${resolvedTargetPath}`);
                            return resolvedTargetPath;
                        }
                        // If it doesn't exist, try to create a path relative to the directory
                        const alternativeTargetPath = path.join(path.dirname(directSubmodulePath), targetPath);
                        if (fs.existsSync(alternativeTargetPath)) {
                            console.log(`Found redirected submodule at ${alternativeTargetPath}`);
                            return alternativeTargetPath;
                        }
                    }
                }
                catch (error) {
                    console.warn(`Error reading ${directSubmodulePath}:`, error);
                }
            }
            // Check package.json for structure information
            const packageJsonPath = path.join(modulePath, 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                try {
                    const packageJson = (0, utils_1.readJSONFile)(packageJsonPath);
                    // Check exports field
                    if (packageJson.exports) {
                        const exports = packageJson.exports;
                        let exportPath;
                        if (typeof exports === 'string') {
                            exportPath = exports;
                        }
                        else if (exports[`./${subModule}`]) {
                            exportPath = typeof exports[`./${subModule}`] === 'string'
                                ? exports[`./${subModule}`]
                                : exports[`./${subModule}`].require || exports[`./${subModule}`].default;
                        }
                        else if (exports[subModule]) {
                            exportPath = typeof exports[subModule] === 'string'
                                ? exports[subModule]
                                : exports[subModule].require || exports[subModule].default;
                        }
                        if (exportPath) {
                            const resolvedPath = path.join(modulePath, exportPath);
                            if (fs.existsSync(resolvedPath)) {
                                console.log(`Found submodule through exports: ${resolvedPath}`);
                                return resolvedPath;
                            }
                        }
                    }
                    // Check if it's in the main file
                    if (packageJson.main) {
                        const mainPath = path.join(modulePath, packageJson.main);
                        if (fs.existsSync(mainPath)) {
                            // Not an ideal solution, but better than nothing
                            console.log(`Using main file as fallback for ${request}: ${mainPath}`);
                            return mainPath;
                        }
                    }
                }
                catch (error) {
                    console.warn(`Error parsing package.json for ${packageName}:`, error);
                }
            }
        }
        return null;
    }
    /**
     * Finds a nested dependency
     * @param request Module request
     * @param issuer Issuer path
     * @returns Path to the nested dependency or null if not found
     */
    findNestedDependency(request, issuer) {
        if (!issuer || !request) {
            return null;
        }
        // Check if it's a problematic module
        if (this.cache.problematicModules.has(request)) {
            const nestedModulePath = this.findNestedProblemModule(request, issuer);
            if (nestedModulePath) {
                return nestedModulePath;
            }
        }
        // Check if it's a dependency we want to track
        if (!this.depsList.some(dep => request.includes(dep))) {
            return null;
        }
        const cacheKey = `${request}:${issuer}`;
        if (this.cache.resolvedModules.has(cacheKey)) {
            return this.cache.resolvedModules.get(cacheKey) || null;
        }
        const issuerDir = (0, utils_1.getPackageDir)(issuer);
        if (!issuerDir)
            return null;
        // Extract the package name from the request
        const packageName = (0, utils_1.extractPackageName)(request);
        // Check if the dependency exists in the issuer's node_modules
        const nestedNodeModulesPath = path.join(issuerDir, 'node_modules', packageName);
        if (fs.existsSync(nestedNodeModulesPath)) {
            const packageJsonPath = path.join(nestedNodeModulesPath, 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                const nestedPackageJson = (0, utils_1.readJSONFile)(packageJsonPath);
                // Handle subpath resolution
                let resolvedPath = nestedNodeModulesPath;
                if (request !== packageName) {
                    const subPath = (0, utils_1.extractSubmodulePath)(request, packageName);
                    resolvedPath = path.join(nestedNodeModulesPath, subPath);
                    // If direct path doesn't exist, try to resolve through package.json exports/main
                    if (!(0, utils_1.moduleExists)(resolvedPath)) {
                        if (nestedPackageJson.main) {
                            resolvedPath = path.join(nestedNodeModulesPath, nestedPackageJson.main);
                        }
                        else if (nestedPackageJson.exports) {
                            // Handle exports field
                            const exports = nestedPackageJson.exports;
                            let exportPath;
                            if (typeof exports === 'string') {
                                exportPath = exports;
                            }
                            else if (exports && typeof exports === 'object') {
                                // Check if there's a '.' key
                                if ('.' in exports) {
                                    const mainExport = exports['.'];
                                    if (typeof mainExport === 'string') {
                                        exportPath = mainExport;
                                    }
                                    else if (mainExport && typeof mainExport === 'object' && 'import' in mainExport) {
                                        exportPath = mainExport.import;
                                    }
                                }
                            }
                            if (exportPath) {
                                resolvedPath = path.join(nestedNodeModulesPath, exportPath);
                            }
                        }
                    }
                }
                else if (nestedPackageJson.main) {
                    // If requesting the package itself, resolve to its main entry
                    resolvedPath = path.join(nestedNodeModulesPath, nestedPackageJson.main);
                }
                this.cache.resolvedModules.set(cacheKey, resolvedPath);
                return resolvedPath;
            }
        }
        return null;
    }
    /**
     * Registers nested dependencies for a module
     * @param module Module resource path
     * @param request Module request
     */
    registerNestedDependencies(module, request) {
        // Scan the module's dependencies to find nested dependencies
        const moduleDir = (0, utils_1.getPackageDir)(module);
        if (!moduleDir)
            return;
        const packageJsonPath = path.join(moduleDir, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            const packageJson = (0, utils_1.readJSONFile)(packageJsonPath);
            // Check if this module has dependencies we want to track
            const allDeps = {
                ...(packageJson.dependencies || {}),
                ...(packageJson.devDependencies || {}),
                ...(packageJson.peerDependencies || {})
            };
            Object.keys(allDeps).forEach(dependency => {
                if (this.depsList.includes(dependency)) {
                    // Register this nested dependency for future use
                    const nestedModulePath = path.join(moduleDir, 'node_modules', dependency);
                    if (fs.existsSync(nestedModulePath)) {
                        const nestedPackageJsonPath = path.join(nestedModulePath, 'package.json');
                        if (fs.existsSync(nestedPackageJsonPath)) {
                            const nestedPackageJson = (0, utils_1.readJSONFile)(nestedPackageJsonPath);
                            const mainPath = nestedPackageJson.main || 'index.js';
                            const fullPath = path.join(nestedModulePath, mainPath);
                            // Save this path for future use
                            this.cache.resolvedModules.set(`${dependency}:${module}`, fullPath);
                            console.log(`Registered nested dependency "${dependency}" at "${fullPath}" from "${module}"`);
                            // Check if this is one of the problematic base modules
                            for (const problematicModule of this.cache.problematicModules) {
                                const baseName = problematicModule.split('/')[0];
                                if (dependency === baseName) {
                                    // Add information about submodules
                                    const subModuleName = problematicModule.split('/').slice(1).join('/');
                                    const possiblePaths = (0, utils_1.getPossibleSubmodulePaths)(nestedModulePath, subModuleName);
                                    for (const possiblePath of possiblePaths) {
                                        if (fs.existsSync(possiblePath)) {
                                            this.cache.resolvedModules.set(`${problematicModule}:${module}`, possiblePath);
                                            console.log(`Registered problematic submodule "${problematicModule}" at "${possiblePath}" from "${module}"`);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }
    }
}
exports.ModuleResolver = ModuleResolver;
//# sourceMappingURL=ModuleResolver.js.map