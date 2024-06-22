import path from 'path';
import fs from 'fs';

export function createSymlink(symLinkDir: string, targetDir: string): void {
    // Ensure absolute paths
    const absoluteTarget = path.resolve(symLinkDir);
    const absolutePathForLink = path.resolve(targetDir);

    // Create the symlink
    fs.symlink(absoluteTarget, absolutePathForLink, (err) => {
        if (err) {
            console.error('Error creating symlink:', err);
            return;
        }

        // Log success message
        console.log(`Symlink created: ${absolutePathForLink} -> ${absoluteTarget}`);
    });
}

export function removeDirectory(dirPath: string, clearContents = false): void {
    const absoluteDirPath = path.resolve(dirPath);

    if (!fs.existsSync(absoluteDirPath)) {
        console.warn(`Directory "${absoluteDirPath}" does not exist.`);
        return;
    }

    if(clearContents){
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        
        entries.forEach(entry => {
            const fullPath = path.join(dirPath, entry.name);
            if (entry.isDirectory()) {
                // Recursively delete directory contents
                removeDirectory(fullPath);
            } else {
                // Delete file
                fs.unlinkSync(fullPath);
            }
        });
       return;
    }

    fs.rm(absoluteDirPath, { recursive: true, force: true }, (err: Error | any) => {
        if (err) {
            console.error('Error removing directory:', err);
            return;
        }
        console.log(`Directory removed: ${absoluteDirPath}`);
    });
}

export function linkWorkspaces(packageJsonPath: string, rootDir: string): void {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    packageJson.workspaces.forEach((workspace: string) => {
        linkWorkspace(workspace, rootDir);
    });
}

export function linkWorkspace(workspace: string, rootDir: string): void {
    if (fs.existsSync(`${rootDir}/${workspace}/node_modules`)) {
        removeDirectory(`${rootDir}/${workspace}/node_modules`);
    }

    createSymlink(`${rootDir}/node_modules`, `${rootDir}/${workspace}/node_modules`);
}

export function removeWorkspacePackages(packageJsonPath: string, rootDir: string): void {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    packageJson.workspaces.forEach((workspace: string) => {
        if (fs.existsSync(`${rootDir}/${workspace}/node_modules`)) {
            removeDirectory(`${rootDir}/${workspace}/node_modules`);
        }
    });
}

export function findRootWorkspacePath(currentPath: string): string {
    const parentPackageJsonPath = path.join(currentPath + '/..', 'package.json');
    const parentPackageDir = path.dirname(parentPackageJsonPath);    

    if (fs.existsSync(parentPackageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(parentPackageJsonPath, 'utf-8'));

        if (packageJson.workspaces) {
            return findRootWorkspacePath(parentPackageDir);
        }
    }else{
        const parentPackageJsonPath = path.join(currentPath + '/../..', 'package.json');     
        const parentPackageDir = path.dirname(parentPackageJsonPath);

        if (fs.existsSync(parentPackageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(parentPackageJsonPath, 'utf-8'));
            if (packageJson.workspaces) {
                return findRootWorkspacePath(parentPackageDir);
            }
        }
    }

    return currentPath;
}

export function findPackageDir(currentPath: string, i: number = 0): string {
    if(i > 10){
        throw new Error('Too much recursion applied. Create package.json somewhere in: ' + currentPath);
    }

    const packageJsonPath = path.join(currentPath, 'package.json');

    if (fs.existsSync(packageJsonPath)) {    
        return currentPath;
      
    }

    const parentPackageJsonPath = path.join(currentPath + '/..', 'package.json');
    const parentPackageDir = path.dirname(parentPackageJsonPath);
    
    return findPackageDir(parentPackageDir, i+1);    
}

export function getActiveWorkSpaces(currentPath: string, mode: 'all' | 'frontend' | 'backend' = 'all'): string[] {
    if (!currentPath) {
        throw new Error('[_tools.ts:getActiveWorkSpaces] "currentPath" argument is required.');
    }

    if (!(['all', 'frontend', 'backend'].includes(mode))) {
        throw new Error('[_tools.ts:getActiveWorkSpaces] "mode" argument can be only: "frontend", "backend" or "all".');
    }

    const rootPkgDir = findRootWorkspacePath(currentPath);
    const parentPackageJsonPath = path.join(rootPkgDir, 'package.json');

    if (fs.existsSync(parentPackageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(parentPackageJsonPath, 'utf-8'));

        if (packageJson.workspaces) {
            return packageJson.workspaces.map((workspaceName: string) => path.join(rootPkgDir, workspaceName)).filter((workspaceDir: string) => {
                if (mode === 'all') {
                    return true;
                }

                let rwsPkgName = '@rws-framework/server';

                if (mode === 'frontend') {
                    rwsPkgName = '@rws-framework/client';
                }

                const workspaceWebpackFilePath = path.join(workspaceDir, 'package.json');
                const workspacePackageJson = JSON.parse(fs.readFileSync(workspaceWebpackFilePath, 'utf-8'));

                return workspacePackageJson.dependencies && !!workspacePackageJson.dependencies[rwsPkgName];
            });
        }
    }

    return [currentPath];
}


export function relativize(inputPath: string, relationBase: string = null): string
{
    if(relationBase === null && !!process && typeof process.cwd === 'function'){
        relationBase = process.cwd();
    }

    if (inputPath[0] === '.') {
        return path.resolve(relationBase, inputPath);
    }    

    return inputPath;
}