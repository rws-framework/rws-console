import * as fs from 'fs';
import * as path from 'path';
import { NormalModule } from 'webpack';
import { ModuleCache } from './types';
import { getPossibleSubmodulePaths, getPackageDir } from './utils';

/**
 * Handles patching of files with problematic imports
 */
export class FilePatcher {
  private cache: ModuleCache;

  constructor(cache: ModuleCache) {
    this.cache = cache;
  }

  /**
   * Patches hardcoded imports in a module
   * @param module Module to patch
   */
  patchHardcodedImports(module: NormalModule): void {
    const filePath = module.resource;
    
    // Check if we've already patched this file
    if (this.cache.patchedFiles.has(filePath)) {
      return;
    }
    
    try {
      // Check if the file exists
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      // Read the file content
      let content = fs.readFileSync(filePath, 'utf-8');
      let modified = false;
      
      // Check if the file contains problematic imports
      for (const problematicModule of this.cache.problematicModules) {
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
            // Find the path to the correct module
            const packageDir = getPackageDir(filePath);
            if (!packageDir) continue;
            
            const parts = problematicModule.split('/');
            const packageName = parts[0];
            const subModule = parts.slice(1).join('/');
            
            // Look for the module in node_modules
            const modulePath = path.join(packageDir, 'node_modules', packageName);
            if (!fs.existsSync(modulePath)) continue;
            
            // Find the correct path to the submodule
            let resolvedSubmodulePath = '';
            const possiblePaths = getPossibleSubmodulePaths(modulePath, subModule);
            
            for (const possiblePath of possiblePaths) {
              if (fs.existsSync(possiblePath)) {
                resolvedSubmodulePath = possiblePath;
                break;
              }
            }
            
            if (!resolvedSubmodulePath) continue;
            
            // Calculate the relative path from the file to the submodule
            const relativeSubmodulePath = path.relative(path.dirname(filePath), resolvedSubmodulePath)
              .replace(/\\/g, '/'); // Replace backslashes with forward slashes for Node.js compatibility
            
            // Replace the import in the file
            content = content.replace(regex, (match) => {
              if (match.includes('require')) {
                return `require('${relativeSubmodulePath}')`;
              } else if (match.includes('from')) {
                return match.replace(`"${problematicModule}"`, `"${relativeSubmodulePath}"`)
                           .replace(`'${problematicModule}'`, `'${relativeSubmodulePath}'`);
              } else if (match.includes('import')) {
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
      
      // Save the modified file
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Successfully patched ${filePath}`);
      }
      
      // Mark the file as patched
      this.cache.patchedFiles.add(filePath);
      
    } catch (error) {
      console.warn(`Error patching file ${filePath}:`, error);
    }
  }

  /**
   * Checks and patches parse5 files
   * @param module Module to check and patch
   */
  checkAndPatchParse5(module: NormalModule): void {
    const filePath = module.resource;
    
    // Check if this is a parse5 file
    if (!filePath || !filePath.includes('parse5')) {
      return;
    }
    
    // Check if this is a tokenizer or serializer
    if (!filePath.includes('tokenizer') && !filePath.includes('serializer')) {
      return;
    }
    
    try {
      // Check if the file exists
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      // Read the file content
      let content = fs.readFileSync(filePath, 'utf-8');
      let modified = false;
      
      // Check if the file contains problematic imports
      const entitiesDecodeRegex = /require\(['"]entities\/decode['"]\)/g;
      const entitiesEscapeRegex = /require\(['"]entities\/escape['"]\)/g;
      const importDecodeRegex = /from ['"]entities\/decode['"]/g;
      const importEscapeRegex = /from ['"]entities\/escape['"]/g;
      
      // Find the node_modules directory for this file
      const moduleDir = getPackageDir(filePath);
      if (!moduleDir) return;
      
      // Look for entities in node_modules
      const entitiesPath = path.join(moduleDir, 'node_modules', 'entities');
      if (!fs.existsSync(entitiesPath)) {
        console.log(`Entities module not found for ${filePath}, installing...`);
        
        // We could add code here to automatically install entities
        // e.g., by calling npm/yarn install
        
        return;
      }
      
      // Find paths to decode.js and escape.js
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
      
      // If we found the paths, replace the imports
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
      
      // Save the modified file
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Successfully patched ${filePath}`);
        
        // Add the file to the list of patched files
        this.cache.patchedFiles.add(filePath);
      }
      
    } catch (error) {
      console.warn(`Error patching parse5 file ${filePath}:`, error);
    }
  }
}
