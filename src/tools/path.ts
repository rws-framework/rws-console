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

export function findRootWorkspacePath(currentPath: string = null, depth: number = 0): string {
    const overrideOptionString = [...process.argv].splice(2).find(item => item.startsWith('--execDir'));    
    
    if(overrideOptionString){
        const [optionName, overrideVal] = overrideOptionString.split('=');
        return overrideVal.replace(/"/g, '');
    }    

    
    if(process.env.CONSOLE_ROOT_PATH){
        return process.env.CONSOLE_ROOT_PATH;
    }

    if (!currentPath) {
        currentPath = process.cwd();
    }    
    
    // Prevent infinite recursion by limiting depth to 10
    if (depth >= 10) {
        return currentPath;
    }

    const packageLockPath = path.join(currentPath, 'package.json');

    // Check if package-lock.json exists and has workspaces
    if (fs.existsSync(packageLockPath)) {
        try {
            const packageLock = JSON.parse(fs.readFileSync(packageLockPath, 'utf-8'));            

            if (packageLock.workspaces || packageLock._rws_root) {
                return currentPath;
            }
        } catch (e) {
            console.warn(`Error reading package.json at ${packageLockPath}:`, e);
        }
    }

    // If we haven't found a workspace root, check the parent directory
    const parentDir = path.dirname(currentPath);
    
    // If we've reached the root directory, stop searching
    if (parentDir === currentPath) {
        return currentPath;
    }

    // Recursively check the parent directory
    return findRootWorkspacePath(parentDir, depth + 1);
}

export function findPackageDir(currentPath: string = null, i: number = 0): string {
    const overrideOptionString = [...process.argv].splice(2).find(item => item.startsWith('--workspaceDir'));    
    
    if(overrideOptionString){
        const [optionName, overrideVal] = overrideOptionString.split('=');
        return overrideVal.replace(/"/g, '');
    }    

    if(process.env.CONSOLE_ROOT_PATH){
        return process.env.CONSOLE_ROOT_PATH;
    }

    if(!currentPath){
        currentPath = process.cwd();
    }

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

export function getActiveWorkSpaces(currentPath: string = null, mode: 'all' | 'frontend' | 'backend' = 'all'): string[] {
    if (!currentPath) {
        currentPath = process.cwd();
        console.warn(`[_tools.ts:getActiveWorkSpaces] "currentPath" argument is required. Defaulting to: "${currentPath}"`);
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
