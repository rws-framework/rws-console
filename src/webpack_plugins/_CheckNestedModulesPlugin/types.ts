import { PackageJson } from 'type-fest';

// Interface for the exports field in package.json
export interface ExportMap {
  [key: string]: string | { [condition: string]: string } | ExportMap;
}

// Interface for module resolution cache
export interface ModuleCache {
  resolvedModules: Map<string, string>;
  problematicModules: Set<string>;
  patchedFiles: Set<string>;
}
