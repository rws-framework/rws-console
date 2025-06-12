import { PackageJson } from 'type-fest';
/**
 * Reads and parses a JSON file
 * @param filePath Path to the JSON file
 * @returns Parsed JSON content or empty object on error
 */
export declare function readJSONFile(filePath: string): PackageJson;
/**
 * Finds possible paths for a submodule within a package
 * @param modulePath Base path to the module
 * @param subModule Name of the submodule
 * @returns Array of possible paths where the submodule might be located
 */
export declare function getPossibleSubmodulePaths(modulePath: string, subModule: string): string[];
/**
 * Extracts the package name from a request
 * @param request Module request string
 * @returns Package name
 */
export declare function extractPackageName(request: string): string;
/**
 * Extracts the submodule path from a request
 * @param request Module request string
 * @param packageName Package name
 * @returns Submodule path or empty string if request is just the package name
 */
export declare function extractSubmodulePath(request: string, packageName: string): string;
/**
 * Checks if a module exists at the given path
 * @param modulePath Path to check
 * @returns True if the module exists, false otherwise
 */
export declare function moduleExists(modulePath: string): boolean;
/**
 * Gets the package directory for a module
 * @param modulePath Path to the module
 * @returns Path to the package directory or null if not found
 */
export declare function getPackageDir(modulePath: string): string | null;
