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
exports.readJSONFile = readJSONFile;
exports.getPossibleSubmodulePaths = getPossibleSubmodulePaths;
exports.extractPackageName = extractPackageName;
exports.extractSubmodulePath = extractSubmodulePath;
exports.moduleExists = moduleExists;
exports.getPackageDir = getPackageDir;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const path_1 = require("../../tools/path");
/**
 * Reads and parses a JSON file
 * @param filePath Path to the JSON file
 * @returns Parsed JSON content or empty object on error
 */
function readJSONFile(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    catch (error) {
        console.warn(`Failed to read JSON file at ${filePath}:`, error);
        return {};
    }
}
/**
 * Finds possible paths for a submodule within a package
 * @param modulePath Base path to the module
 * @param subModule Name of the submodule
 * @returns Array of possible paths where the submodule might be located
 */
function getPossibleSubmodulePaths(modulePath, subModule) {
    return [
        path.join(modulePath, `${subModule}.js`),
        path.join(modulePath, 'lib', `${subModule}.js`),
        path.join(modulePath, 'dist', `${subModule}.js`),
        path.join(modulePath, 'dist', 'commonjs', `${subModule}.js`),
        path.join(modulePath, 'src', `${subModule}.js`),
        path.join(modulePath, 'cjs', `${subModule}.js`),
        path.join(modulePath, 'commonjs', `${subModule}.js`)
    ];
}
/**
 * Extracts the package name from a request
 * @param request Module request string
 * @returns Package name
 */
function extractPackageName(request) {
    let packageName = request;
    if (request.includes('/')) {
        packageName = request.startsWith('@')
            ? request.split('/').slice(0, 2).join('/')
            : request.split('/')[0];
    }
    return packageName;
}
/**
 * Extracts the submodule path from a request
 * @param request Module request string
 * @param packageName Package name
 * @returns Submodule path or empty string if request is just the package name
 */
function extractSubmodulePath(request, packageName) {
    if (request === packageName) {
        return '';
    }
    return request.substring(packageName.length + 1);
}
/**
 * Checks if a module exists at the given path
 * @param modulePath Path to check
 * @returns True if the module exists, false otherwise
 */
function moduleExists(modulePath) {
    return fs.existsSync(modulePath) || fs.existsSync(modulePath + '.js');
}
/**
 * Gets the package directory for a module
 * @param modulePath Path to the module
 * @returns Path to the package directory or null if not found
 */
function getPackageDir(modulePath) {
    return (0, path_1.findPackageDir)(modulePath);
}
//# sourceMappingURL=utils.js.map