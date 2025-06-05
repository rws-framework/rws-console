"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSymlink = createSymlink;
exports.removeDirectory = removeDirectory;
exports.linkWorkspaces = linkWorkspaces;
exports.linkWorkspace = linkWorkspace;
exports.removeWorkspacePackages = removeWorkspacePackages;
exports.findRootWorkspacePath = findRootWorkspacePath;
exports.findPackageDir = findPackageDir;
exports.getActiveWorkSpaces = getActiveWorkSpaces;
exports.relativize = relativize;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function createSymlink(symLinkDir, targetDir) {
    // Ensure absolute paths
    const absoluteTarget = path_1.default.resolve(symLinkDir);
    const absolutePathForLink = path_1.default.resolve(targetDir);
    // Create the symlink
    fs_1.default.symlink(absoluteTarget, absolutePathForLink, (err) => {
        if (err) {
            console.error('Error creating symlink:', err);
            return;
        }
        // Log success message
        console.log(`Symlink created: ${absolutePathForLink} -> ${absoluteTarget}`);
    });
}
function removeDirectory(dirPath, clearContents = false) {
    const absoluteDirPath = path_1.default.resolve(dirPath);
    if (!fs_1.default.existsSync(absoluteDirPath)) {
        console.warn(`Directory "${absoluteDirPath}" does not exist.`);
        return;
    }
    if (clearContents) {
        const entries = fs_1.default.readdirSync(dirPath, { withFileTypes: true });
        entries.forEach(entry => {
            const fullPath = path_1.default.join(dirPath, entry.name);
            if (entry.isDirectory()) {
                // Recursively delete directory contents
                removeDirectory(fullPath);
            }
            else {
                // Delete file
                fs_1.default.unlinkSync(fullPath);
            }
        });
        return;
    }
    fs_1.default.rm(absoluteDirPath, { recursive: true, force: true }, (err) => {
        if (err) {
            console.error('Error removing directory:', err);
            return;
        }
        console.log(`Directory removed: ${absoluteDirPath}`);
    });
}
function linkWorkspaces(packageJsonPath, rootDir) {
    const packageJson = JSON.parse(fs_1.default.readFileSync(packageJsonPath, 'utf-8'));
    packageJson.workspaces.forEach((workspace) => {
        linkWorkspace(workspace, rootDir);
    });
}
function linkWorkspace(workspace, rootDir) {
    if (fs_1.default.existsSync(`${rootDir}/${workspace}/node_modules`)) {
        removeDirectory(`${rootDir}/${workspace}/node_modules`);
    }
    createSymlink(`${rootDir}/node_modules`, `${rootDir}/${workspace}/node_modules`);
}
function removeWorkspacePackages(packageJsonPath, rootDir) {
    const packageJson = JSON.parse(fs_1.default.readFileSync(packageJsonPath, 'utf-8'));
    packageJson.workspaces.forEach((workspace) => {
        if (fs_1.default.existsSync(`${rootDir}/${workspace}/node_modules`)) {
            removeDirectory(`${rootDir}/${workspace}/node_modules`);
        }
    });
}
function findRootWorkspacePath(currentPath = null, depth = 0) {
    const overrideOptionString = [...process.argv].splice(2).find(item => item.startsWith('--execDir'));
    if (overrideOptionString) {
        const [optionName, overrideVal] = overrideOptionString.split('=');
        return overrideVal.replace(/"/g, '');
    }
    if (!currentPath) {
        currentPath = process.cwd();
    }
    // Prevent infinite recursion by limiting depth to 10
    if (depth >= 10) {
        return currentPath;
    }
    const packageLockPath = path_1.default.join(currentPath, 'package.json');
    // Check if package-lock.json exists and has workspaces
    if (fs_1.default.existsSync(packageLockPath)) {
        try {
            const packageLock = JSON.parse(fs_1.default.readFileSync(packageLockPath, 'utf-8'));
            if (packageLock.workspaces || packageLock._rws_root) {
                return currentPath;
            }
        }
        catch (e) {
            console.warn(`Error reading package.json at ${packageLockPath}:`, e);
        }
    }
    // If we haven't found a workspace root, check the parent directory
    const parentDir = path_1.default.dirname(currentPath);
    // If we've reached the root directory, stop searching
    if (parentDir === currentPath) {
        return currentPath;
    }
    // Recursively check the parent directory
    return findRootWorkspacePath(parentDir, depth + 1);
}
function findPackageDir(currentPath = null, i = 0) {
    const overrideOptionString = [...process.argv].splice(2).find(item => item.startsWith('--workspaceDir'));
    if (overrideOptionString) {
        const [optionName, overrideVal] = overrideOptionString.split('=');
        return overrideVal.replace(/"/g, '');
    }
    if (!currentPath) {
        currentPath = process.cwd();
    }
    if (i > 10) {
        throw new Error('Too much recursion applied. Create package.json somewhere in: ' + currentPath);
    }
    const packageJsonPath = path_1.default.join(currentPath, 'package.json');
    if (fs_1.default.existsSync(packageJsonPath)) {
        return currentPath;
    }
    const parentPackageJsonPath = path_1.default.join(currentPath + '/..', 'package.json');
    const parentPackageDir = path_1.default.dirname(parentPackageJsonPath);
    return findPackageDir(parentPackageDir, i + 1);
}
function getActiveWorkSpaces(currentPath = null, mode = 'all') {
    if (!currentPath) {
        currentPath = process.cwd();
        console.warn(`[_tools.ts:getActiveWorkSpaces] "currentPath" argument is required. Defaulting to: "${currentPath}"`);
    }
    if (!(['all', 'frontend', 'backend'].includes(mode))) {
        throw new Error('[_tools.ts:getActiveWorkSpaces] "mode" argument can be only: "frontend", "backend" or "all".');
    }
    const rootPkgDir = findRootWorkspacePath(currentPath);
    const parentPackageJsonPath = path_1.default.join(rootPkgDir, 'package.json');
    if (fs_1.default.existsSync(parentPackageJsonPath)) {
        const packageJson = JSON.parse(fs_1.default.readFileSync(parentPackageJsonPath, 'utf-8'));
        if (packageJson.workspaces) {
            return packageJson.workspaces.map((workspaceName) => path_1.default.join(rootPkgDir, workspaceName)).filter((workspaceDir) => {
                if (mode === 'all') {
                    return true;
                }
                let rwsPkgName = '@rws-framework/server';
                if (mode === 'frontend') {
                    rwsPkgName = '@rws-framework/client';
                }
                const workspaceWebpackFilePath = path_1.default.join(workspaceDir, 'package.json');
                const workspacePackageJson = JSON.parse(fs_1.default.readFileSync(workspaceWebpackFilePath, 'utf-8'));
                return workspacePackageJson.dependencies && !!workspacePackageJson.dependencies[rwsPkgName];
            });
        }
    }
    return [currentPath];
}
function relativize(inputPath, relationBase = null) {
    if (relationBase === null && !!process && typeof process.cwd === 'function') {
        relationBase = process.cwd();
    }
    if (inputPath[0] === '.') {
        return path_1.default.resolve(relationBase, inputPath);
    }
    return inputPath;
}
//# sourceMappingURL=path.js.map