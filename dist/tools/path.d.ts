export declare function createSymlink(symLinkDir: string, targetDir: string): void;
export declare function removeDirectory(dirPath: string, clearContents?: boolean): void;
export declare function linkWorkspaces(packageJsonPath: string, rootDir: string): void;
export declare function linkWorkspace(workspace: string, rootDir: string): void;
export declare function removeWorkspacePackages(packageJsonPath: string, rootDir: string): void;
export declare function findRootWorkspacePath(currentPath: string): string;
export declare function findPackageDir(currentPath: string, i?: number): string;
export declare function getActiveWorkSpaces(currentPath: string, mode?: 'all' | 'frontend' | 'backend'): string[];
export declare function relativize(inputPath: string, relationBase?: string): string;
