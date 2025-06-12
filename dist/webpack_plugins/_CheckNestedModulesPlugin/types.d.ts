export interface ExportMap {
    [key: string]: string | {
        [condition: string]: string;
    } | ExportMap;
}
export interface ModuleCache {
    resolvedModules: Map<string, string>;
    problematicModules: Set<string>;
    patchedFiles: Set<string>;
}
