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
exports.CheckNestedModulesPlugin = void 0;
const webpack_1 = require("webpack");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const path_1 = require("../tools/path");
class CheckNestedModulesPlugin {
    depsList;
    resolvedModules = new Map();
    problematicModules;
    patchedFiles = new Set();
    constructor(depsList = [], problematicModules = ['entities/decode', 'entities/escape']) {
        this.depsList = depsList;
        // Konwertujemy tablicę na Set dla szybszego wyszukiwania
        this.problematicModules = new Set(problematicModules);
        // Dodajemy podstawowe pakiety z problematicModules do listy zależności
        const basePackages = new Set();
        problematicModules.forEach(module => {
            const packageName = module.split('/')[0];
            basePackages.add(packageName);
        });
        // Dodajemy wszystkie bazowe pakiety do depsList, jeśli jeszcze ich nie ma
        basePackages.forEach(pkg => {
            if (!this.depsList.includes(pkg)) {
                this.depsList.push(pkg);
            }
        });
        console.log(`NestedDependencyResolverPlugin initialized with dependencies: ${this.depsList.join(', ')}`);
        console.log(`Problematic modules: ${Array.from(this.problematicModules).join(', ')}`);
    }
    readJSONFile(dependencyPackageJsonPath) {
        try {
            return JSON.parse(fs.readFileSync(dependencyPackageJsonPath, 'utf-8'));
        }
        catch (error) {
            console.warn(`Failed to read JSON file at ${dependencyPackageJsonPath}:`, error);
            return {};
        }
    }
    findNestedProblemModule(request, issuer) {
        if (!this.problematicModules.has(request)) {
            return null;
        }
        // Znajdźmy moduł, który importuje problematyczny moduł
        const parts = request.split('/');
        const packageName = parts[0]; // np. 'entities'
        const subModule = parts.slice(1).join('/'); // np. 'decode' lub 'escape'
        // Znajdź katalog pakietu, który zawiera issuer
        const issuerPackageDir = (0, path_1.findPackageDir)(issuer);
        if (!issuerPackageDir)
            return null;
        // Szukamy problematycznego modułu w node_modules issuera
        const modulePath = path.join(issuerPackageDir, 'node_modules', packageName);
        if (fs.existsSync(modulePath)) {
            console.log(`Found module ${packageName} at ${modulePath} for request ${request} from ${issuer}`);
            // Sprawdźmy różne możliwe lokalizacje dla submodułu
            const possiblePaths = [
                path.join(modulePath, `${subModule}.js`),
                path.join(modulePath, 'lib', `${subModule}.js`),
                path.join(modulePath, 'dist', `${subModule}.js`),
                path.join(modulePath, 'dist', 'commonjs', `${subModule}.js`),
                path.join(modulePath, 'src', `${subModule}.js`),
                path.join(modulePath, 'cjs', `${subModule}.js`),
                path.join(modulePath, 'commonjs', `${subModule}.js`)
            ];
            for (const possiblePath of possiblePaths) {
                if (fs.existsSync(possiblePath)) {
                    console.log(`Found nested submodule at ${possiblePath}`);
                    return possiblePath;
                }
            }
            // Sprawdźmy zawartość pliku submodule.js, żeby zobaczyć, czy nie jest to plik przekierowujący
            const directSubmodulePath = path.join(modulePath, `${subModule}.js`);
            if (fs.existsSync(directSubmodulePath)) {
                try {
                    const content = fs.readFileSync(directSubmodulePath, 'utf-8');
                    // Sprawdź, czy plik zawiera przekierowanie do innego pliku
                    const requireMatch = content.match(/require\(['"](.+)['"]\)/);
                    if (requireMatch && requireMatch[1]) {
                        const targetPath = requireMatch[1];
                        const resolvedTargetPath = path.join(modulePath, targetPath);
                        // Sprawdź, czy ścieżka docelowa istnieje
                        if (fs.existsSync(resolvedTargetPath)) {
                            console.log(`Found redirected submodule at ${resolvedTargetPath}`);
                            return resolvedTargetPath;
                        }
                        // Jeśli nie istnieje, spróbuj utworzyć ścieżkę względem katalogu głównego
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
            // Sprawdźmy package.json, może tam znajdziemy informacje o strukturze
            const packageJsonPath = path.join(modulePath, 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                try {
                    const packageJson = this.readJSONFile(packageJsonPath);
                    // Sprawdźmy exports
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
                    // Sprawdźmy, czy może jest to w głównym pliku
                    if (packageJson.main) {
                        const mainPath = path.join(modulePath, packageJson.main);
                        if (fs.existsSync(mainPath)) {
                            // To nie jest idealne rozwiązanie, ale lepsze niż nic
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
    findNestedDependency(request, issuer) {
        if (!issuer || !request) {
            return null;
        }
        // Sprawdźmy, czy to jest problematyczny moduł
        if (this.problematicModules.has(request)) {
            const nestedModulePath = this.findNestedProblemModule(request, issuer);
            if (nestedModulePath) {
                return nestedModulePath;
            }
        }
        // Sprawdźmy, czy to jest zależność, którą chcemy śledzić
        if (!this.depsList.some(dep => request.includes(dep))) {
            return null;
        }
        const cacheKey = `${request}:${issuer}`;
        if (this.resolvedModules.has(cacheKey)) {
            return this.resolvedModules.get(cacheKey) || null;
        }
        const issuerDir = (0, path_1.findPackageDir)(issuer);
        if (!issuerDir)
            return null;
        // Extract the package name from the request
        let packageName = request;
        if (request.includes('/')) {
            packageName = request.startsWith('@')
                ? request.split('/').slice(0, 2).join('/')
                : request.split('/')[0];
        }
        // Check if the dependency exists in the issuer's node_modules
        const nestedNodeModulesPath = path.join(issuerDir, 'node_modules', packageName);
        if (fs.existsSync(nestedNodeModulesPath)) {
            const packageJsonPath = path.join(nestedNodeModulesPath, 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                const nestedPackageJson = this.readJSONFile(packageJsonPath);
                // Handle subpath resolution
                let resolvedPath = nestedNodeModulesPath;
                if (request !== packageName) {
                    const subPath = request.substring(packageName.length + 1);
                    resolvedPath = path.join(nestedNodeModulesPath, subPath);
                    // If direct path doesn't exist, try to resolve through package.json exports/main
                    if (!fs.existsSync(resolvedPath) && !fs.existsSync(resolvedPath + '.js')) {
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
                                // Sprawdź, czy istnieje klucz '.'
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
                console.log(`Resolved nested dependency "${request}" to "${resolvedPath}" from issuer "${issuer}"`);
                this.resolvedModules.set(cacheKey, resolvedPath);
                return resolvedPath;
            }
        }
        return null;
    }
    // Nowa metoda do patchowania plików, które mają hardcodowane importy
    patchHardcodedImports(module) {
        const filePath = module.resource;
        // Sprawdź, czy już patchowaliśmy ten plik
        if (this.patchedFiles.has(filePath)) {
            return;
        }
        try {
            // Sprawdź, czy plik istnieje
            if (!fs.existsSync(filePath)) {
                return;
            }
            // Przeczytaj zawartość pliku
            let content = fs.readFileSync(filePath, 'utf-8');
            let modified = false;
            // Sprawdź, czy plik zawiera problematyczne importy
            for (const problematicModule of this.problematicModules) {
                const importRegexes = [
                    new RegExp(`require\\(['"]${problematicModule}['"]\\)`, 'g'),
                    new RegExp(`from ['"]${problematicModule}['"]`, 'g'),
                    new RegExp(`import ['"]${problematicModule}['"]`, 'g'),
                    new RegExp(`import \\* as [a-zA-Z0-9_]+ from ['"]${problematicModule}['"]`, 'g'),
                    new RegExp(`import { [^}]+ } from ['"]${problematicModule}['"]`, 'g'),
                    new RegExp(`import [a-zA-Z0-9_]+ from ['"]${problematicModule}['"]`, 'g')
                ];
                for (const regex of importRegexes) {
                    if (regex.test(content)) {
                        // Znajdź ścieżkę do prawidłowego modułu
                        const packageDir = (0, path_1.findPackageDir)(filePath);
                        if (!packageDir)
                            continue;
                        const parts = problematicModule.split('/');
                        const packageName = parts[0];
                        const subModule = parts.slice(1).join('/');
                        // Szukaj modułu w node_modules
                        const modulePath = path.join(packageDir, 'node_modules', packageName);
                        if (!fs.existsSync(modulePath))
                            continue;
                        // Znajdź właściwą ścieżkę do submodułu
                        let resolvedSubmodulePath = '';
                        const possiblePaths = [
                            path.join(modulePath, `${subModule}.js`),
                            path.join(modulePath, 'lib', `${subModule}.js`),
                            path.join(modulePath, 'dist', `${subModule}.js`),
                            path.join(modulePath, 'dist', 'commonjs', `${subModule}.js`),
                            path.join(modulePath, 'src', `${subModule}.js`),
                            path.join(modulePath, 'cjs', `${subModule}.js`)
                        ];
                        for (const possiblePath of possiblePaths) {
                            if (fs.existsSync(possiblePath)) {
                                resolvedSubmodulePath = possiblePath;
                                break;
                            }
                        }
                        if (!resolvedSubmodulePath)
                            continue;
                        // Oblicz relatywną ścieżkę od pliku do submodułu
                        const relativeSubmodulePath = path.relative(path.dirname(filePath), resolvedSubmodulePath)
                            .replace(/\\/g, '/'); // Zamień backslashe na forwardslashe dla zgodności z Node.js
                        // Zastąp import w pliku
                        content = content.replace(regex, (match) => {
                            if (match.includes('require')) {
                                return `require('${relativeSubmodulePath}')`;
                            }
                            else if (match.includes('from')) {
                                return match.replace(`"${problematicModule}"`, `"${relativeSubmodulePath}"`)
                                    .replace(`'${problematicModule}'`, `'${relativeSubmodulePath}'`);
                            }
                            else if (match.includes('import')) {
                                return match.replace(`"${problematicModule}"`, `"${relativeSubmodulePath}"`)
                                    .replace(`'${problematicModule}'`, `'${relativeSubmodulePath}'`);
                            }
                            return match;
                        });
                        modified = true;
                        console.log(`Patched hardcoded import of ${problematicModule} in ${filePath}`);
                    }
                }
            }
            // Zapisz zmodyfikowany plik
            if (modified) {
                fs.writeFileSync(filePath, content, 'utf-8');
                console.log(`Successfully patched ${filePath}`);
            }
            // Oznacz plik jako patchowany
            this.patchedFiles.add(filePath);
        }
        catch (error) {
            console.warn(`Error patching file ${filePath}:`, error);
        }
    }
    // Nowa metoda do sprawdzania i patchowania plików z parse5
    checkAndPatchParse5(module) {
        const filePath = module.resource;
        // Sprawdź, czy to jest plik z parse5
        if (!filePath || !filePath.includes('parse5')) {
            return;
        }
        // Sprawdź, czy to jest tokenizer lub serializer
        if (!filePath.includes('tokenizer') && !filePath.includes('serializer')) {
            return;
        }
        try {
            // Sprawdź, czy plik istnieje
            if (!fs.existsSync(filePath)) {
                return;
            }
            // Przeczytaj zawartość pliku
            let content = fs.readFileSync(filePath, 'utf-8');
            let modified = false;
            // Sprawdź, czy plik zawiera problematyczne importy
            const entitiesDecodeRegex = /require\(['"]entities\/decode['"]\)/g;
            const entitiesEscapeRegex = /require\(['"]entities\/escape['"]\)/g;
            const importDecodeRegex = /from ['"]entities\/decode['"]/g;
            const importEscapeRegex = /from ['"]entities\/escape['"]/g;
            // Znajdź katalog node_modules dla tego pliku
            const moduleDir = (0, path_1.findPackageDir)(filePath);
            if (!moduleDir)
                return;
            // Szukaj entities w node_modules
            const entitiesPath = path.join(moduleDir, 'node_modules', 'entities');
            if (!fs.existsSync(entitiesPath)) {
                console.log(`Entities module not found for ${filePath}, installing...`);
                // Możemy tu dodać kod do automatycznej instalacji entities
                // np. poprzez wywołanie npm/yarn install
                return;
            }
            // Znajdź ścieżki do decode.js i escape.js
            let decodePath = '';
            let escapePath = '';
            const possibleDecodePaths = [
                path.join(entitiesPath, 'decode.js'),
                path.join(entitiesPath, 'lib', 'decode.js'),
                path.join(entitiesPath, 'dist', 'decode.js')
            ];
            const possibleEscapePaths = [
                path.join(entitiesPath, 'escape.js'),
                path.join(entitiesPath, 'lib', 'escape.js'),
                path.join(entitiesPath, 'dist', 'escape.js')
            ];
            for (const possiblePath of possibleDecodePaths) {
                if (fs.existsSync(possiblePath)) {
                    decodePath = possiblePath;
                    break;
                }
            }
            for (const possiblePath of possibleEscapePaths) {
                if (fs.existsSync(possiblePath)) {
                    escapePath = possiblePath;
                    break;
                }
            }
            // Jeśli znaleźliśmy ścieżki, zastąp importy
            if (decodePath) {
                const relativeDecodePath = path.relative(path.dirname(filePath), decodePath)
                    .replace(/\\/g, '/');
                content = content.replace(entitiesDecodeRegex, `require('${relativeDecodePath}')`);
                content = content.replace(importDecodeRegex, `from '${relativeDecodePath}'`);
                modified = true;
                console.log(`Patched entities/decode import in ${filePath} to ${relativeDecodePath}`);
            }
            if (escapePath) {
                const relativeEscapePath = path.relative(path.dirname(filePath), escapePath)
                    .replace(/\\/g, '/');
                content = content.replace(entitiesEscapeRegex, `require('${relativeEscapePath}')`);
                content = content.replace(importEscapeRegex, `from '${relativeEscapePath}'`);
                modified = true;
                console.log(`Patched entities/escape import in ${filePath} to ${relativeEscapePath}`);
            }
            // Zapisz zmodyfikowany plik
            if (modified) {
                fs.writeFileSync(filePath, content, 'utf-8');
                console.log(`Successfully patched ${filePath}`);
                // Dodaj plik do listy patchowanych
                this.patchedFiles.add(filePath);
            }
        }
        catch (error) {
            console.warn(`Error patching parse5 file ${filePath}:`, error);
        }
    }
    apply(compiler) {
        // Hook into the resolver to intercept module resolution
        compiler.hooks.normalModuleFactory.tap('NestedDependencyResolverPlugin', (factory) => {
            // Intercept the module resolution process
            factory.hooks.beforeResolve.tap('NestedDependencyResolverPlugin', (resolveData) => {
                if (!resolveData || !resolveData.request) {
                    return;
                }
                // Sprawdzamy, czy to jest zależność, którą chcemy śledzić
                if (!this.depsList.some(dep => resolveData.request.includes(dep)) &&
                    !this.problematicModules.has(resolveData.request)) {
                    return;
                }
                const issuer = resolveData.contextInfo.issuer || '';
                const nestedPath = this.findNestedDependency(resolveData.request, issuer);
                if (nestedPath) {
                    // Override the request with the nested module path
                    resolveData.request = nestedPath;
                    console.log(`Redirecting "${resolveData.request}" to nested dependency at "${nestedPath}"`);
                }
            });
            // Hook into the resolver plugin to handle module resolution
            const resolver = compiler.resolverFactory.get('normal', {});
            if (resolver && resolver.hooks && resolver.hooks.resolve) {
                resolver.hooks.resolve.tapAsync('NestedDependencyResolverPlugin', (request, resolveContext, callback) => {
                    if (!request.request) {
                        return callback();
                    }
                    // Sprawdzamy, czy to jest zależność, którą chcemy śledzić
                    if (!this.depsList.some(dep => request.request.includes(dep)) &&
                        !this.problematicModules.has(request.request)) {
                        return callback();
                    }
                    const context = typeof request.context === 'string' ? request.context : '';
                    const nestedPath = this.findNestedDependency(request.request, context);
                    if (nestedPath) {
                        // Create a new request with the nested path
                        const newRequest = { ...request, request: nestedPath };
                        return resolver.doResolve(resolver.hooks.resolve, newRequest, `Resolved to nested dependency: ${nestedPath}`, resolveContext, callback);
                    }
                    return callback();
                });
            }
        });
        // Dodajemy hook do obsługi brakujących modułów
        compiler.hooks.compilation.tap('NestedDependencyResolverPlugin', (compilation) => {
            // Przechwytujemy błędy modułów
            compilation.hooks.failedModule.tap('NestedDependencyResolverPlugin', (module) => {
                if (module instanceof webpack_1.NormalModule) {
                    const request = module.request;
                    // Sprawdzamy, czy to jest błąd związany z problematycznym modułem
                    for (const problematicModule of this.problematicModules) {
                        if (request.includes(problematicModule)) {
                            const packageName = problematicModule.split('/')[0];
                            console.warn(`Failed to resolve module: ${request}`);
                            console.warn(`Try to add '${packageName}' to your dependencies and run npm install`);
                            // Sprawdź, czy to jest parse5
                            if (module.resource && module.resource.includes('parse5')) {
                                console.warn(`This is a parse5 module. Trying to patch...`);
                                this.checkAndPatchParse5(module);
                            }
                            break;
                        }
                    }
                }
            });
            // Dodajemy hook do patchowania modułów przed ich przetworzeniem
            compilation.hooks.buildModule.tap('NestedDependencyResolverPlugin', (module) => {
                if (module instanceof webpack_1.NormalModule) {
                    // Sprawdź, czy to jest moduł parse5
                    if (module.resource && module.resource.includes('parse5')) {
                        this.checkAndPatchParse5(module);
                    }
                    // Sprawdź i patchuj hardcodowane importy
                    this.patchHardcodedImports(module);
                }
            });
            // Monitorujemy załadowane moduły, aby wykryć zagnieżdżone zależności
            compilation.hooks.succeedModule.tap('NestedDependencyResolverPlugin', (module) => {
                if (module instanceof webpack_1.NormalModule) {
                    const request = module.request;
                    const resource = module.resource;
                    // Sprawdzamy, czy to jest moduł, który nas interesuje
                    if (this.depsList.some(dep => request.includes(dep))) {
                        // Skanujemy zależności modułu, aby znaleźć zagnieżdżone zależności
                        const moduleDir = (0, path_1.findPackageDir)(resource);
                        if (moduleDir) {
                            const packageJsonPath = path.join(moduleDir, 'package.json');
                            if (fs.existsSync(packageJsonPath)) {
                                const packageJson = this.readJSONFile(packageJsonPath);
                                // Sprawdzamy, czy ten moduł ma zależności, które chcemy śledzić
                                const allDeps = {
                                    ...(packageJson.dependencies || {}),
                                    ...(packageJson.devDependencies || {}),
                                    ...(packageJson.peerDependencies || {})
                                };
                                Object.keys(allDeps).forEach(dependency => {
                                    if (this.depsList.includes(dependency)) {
                                        // Rejestrujemy tę zagnieżdżoną zależność do przyszłego użycia
                                        const nestedModulePath = path.join(moduleDir, 'node_modules', dependency);
                                        if (fs.existsSync(nestedModulePath)) {
                                            const nestedPackageJsonPath = path.join(nestedModulePath, 'package.json');
                                            if (fs.existsSync(nestedPackageJsonPath)) {
                                                const nestedPackageJson = this.readJSONFile(nestedPackageJsonPath);
                                                const mainPath = nestedPackageJson.main || 'index.js';
                                                const fullPath = path.join(nestedModulePath, mainPath);
                                                // Zapisujemy tę ścieżkę do przyszłego użycia
                                                this.resolvedModules.set(`${dependency}:${resource}`, fullPath);
                                                console.log(`Registered nested dependency "${dependency}" at "${fullPath}" from "${resource}"`);
                                                // Sprawdzamy, czy to jest jeden z problematycznych modułów bazowych
                                                for (const problematicModule of this.problematicModules) {
                                                    const baseName = problematicModule.split('/')[0];
                                                    if (dependency === baseName) {
                                                        // Dodajemy informacje o podmodułach
                                                        const subModuleName = problematicModule.split('/').slice(1).join('/');
                                                        const possiblePaths = [
                                                            path.join(nestedModulePath, `${subModuleName}.js`),
                                                            path.join(nestedModulePath, 'lib', `${subModuleName}.js`),
                                                            path.join(nestedModulePath, 'dist', `${subModuleName}.js`),
                                                            path.join(nestedModulePath, 'src', `${subModuleName}.js`),
                                                            path.join(nestedModulePath, 'cjs', `${subModuleName}.js`)
                                                        ];
                                                        for (const possiblePath of possiblePaths) {
                                                            if (fs.existsSync(possiblePath)) {
                                                                this.resolvedModules.set(`${problematicModule}:${resource}`, possiblePath);
                                                                console.log(`Registered problematic submodule "${problematicModule}" at "${possiblePath}" from "${resource}"`);
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
                }
            });
        });
        compiler.hooks.done.tap('NestedDependencyResolverPlugin', (stats) => {
            console.log(`NestedDependencyResolverPlugin resolved ${this.resolvedModules.size} nested dependencies`);
            if (stats.hasErrors()) {
                const errors = stats.compilation.errors;
                // Sprawdzamy, czy są błędy związane z problematycznymi modułami
                for (const problematicModule of this.problematicModules) {
                    const basePackage = problematicModule.split('/')[0];
                    const moduleErrors = errors.filter(error => error.message && error.message.includes(problematicModule));
                    if (moduleErrors.length > 0) {
                        console.warn(`Found ${moduleErrors.length} errors related to ${problematicModule}:`);
                        moduleErrors.forEach(error => {
                            console.warn(error.message);
                        });
                    }
                }
            }
        });
    }
}
exports.CheckNestedModulesPlugin = CheckNestedModulesPlugin;
//# sourceMappingURL=CheckNestedModulesPlugin.js.map