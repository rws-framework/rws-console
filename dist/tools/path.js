"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveWorkSpaces = exports.findRootWorkspacePath = exports.removeWorkspacePackages = exports.linkWorkspace = exports.linkWorkspaces = exports.removeDirectory = exports.createSymlink = void 0;
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
exports.createSymlink = createSymlink;
function removeDirectory(dirPath) {
    const absoluteDirPath = path_1.default.resolve(dirPath);
    if (!fs_1.default.existsSync(absoluteDirPath)) {
        console.warn(`Directory "${absoluteDirPath}" does not exist.`);
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
exports.removeDirectory = removeDirectory;
function linkWorkspaces(packageJsonPath, rootDir) {
    const packageJson = JSON.parse(fs_1.default.readFileSync(packageJsonPath, 'utf-8'));
    packageJson.workspaces.forEach((workspace) => {
        linkWorkspace(workspace, rootDir);
    });
}
exports.linkWorkspaces = linkWorkspaces;
function linkWorkspace(workspace, rootDir) {
    if (fs_1.default.existsSync(`${rootDir}/${workspace}/node_modules`)) {
        removeDirectory(`${rootDir}/${workspace}/node_modules`);
    }
    createSymlink(`${rootDir}/node_modules`, `${rootDir}/${workspace}/node_modules`);
}
exports.linkWorkspace = linkWorkspace;
function removeWorkspacePackages(packageJsonPath, rootDir) {
    const packageJson = JSON.parse(fs_1.default.readFileSync(packageJsonPath, 'utf-8'));
    packageJson.workspaces.forEach((workspace) => {
        if (fs_1.default.existsSync(`${rootDir}/${workspace}/node_modules`)) {
            removeDirectory(`${rootDir}/${workspace}/node_modules`);
        }
    });
}
exports.removeWorkspacePackages = removeWorkspacePackages;
function findRootWorkspacePath(currentPath) {
    const parentPackageJsonPath = path_1.default.join(currentPath + '/..', 'package.json');
    const parentPackageDir = path_1.default.dirname(parentPackageJsonPath);
    if (fs_1.default.existsSync(parentPackageJsonPath)) {
        const packageJson = JSON.parse(fs_1.default.readFileSync(parentPackageJsonPath, 'utf-8'));
        if (packageJson.workspaces) {
            return findRootWorkspacePath(parentPackageDir);
        }
    }
    return currentPath;
}
exports.findRootWorkspacePath = findRootWorkspacePath;
function getActiveWorkSpaces(currentPath, mode = 'all') {
    if (!currentPath) {
        throw new Error('[_tools.ts:getActiveWorkSpaces] "currentPath" argument is required.');
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
exports.getActiveWorkSpaces = getActiveWorkSpaces;
//# sourceMappingURL=path.js.map