import * as fs from 'fs';
import * as path from 'path';
import { PackageJson } from 'type-fest';
import { findPackageDir } from '../../tools/path';

/**
 * Reads and parses a JSON file
 * @param filePath Path to the JSON file
 * @returns Parsed JSON content or empty object on error
 */
export function readJSONFile(filePath: string): PackageJson {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    console.warn(`Failed to read JSON file at ${filePath}:`, error);
    return {} as PackageJson;
  }
}

/**
 * Finds possible paths for a submodule within a package
 * @param modulePath Base path to the module
 * @param subModule Name of the submodule
 * @returns Array of possible paths where the submodule might be located
 */
export function getPossibleSubmodulePaths(modulePath: string, subModule: string): string[] {
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
export function extractPackageName(request: string): string {
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
export function extractSubmodulePath(request: string, packageName: string): string {
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
export function moduleExists(modulePath: string): boolean {
  return fs.existsSync(modulePath) || fs.existsSync(modulePath + '.js');
}

/**
 * Gets the package directory for a module
 * @param modulePath Path to the module
 * @returns Path to the package directory or null if not found
 */
export function getPackageDir(modulePath: string): string | null {
  return findPackageDir(modulePath);
}
