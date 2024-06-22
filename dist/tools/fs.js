"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyFiles = void 0;
exports.removeDirectory = removeDirectory;
const fs_1 = __importDefault(require("fs"));
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
function collectFiles(dir, fileList = []) {
    const files = fs_1.default.readdirSync(dir, { withFileTypes: true });
    files.forEach(file => {
        if (file.isDirectory()) {
            collectFiles(path_1.default.join(dir, file.name), fileList);
        }
        else {
            fileList.push(path_1.default.join(dir, file.name));
        }
    });
    return fileList;
}
function removeDirectory(clearContents = false) {
}
const copyFiles = async (copyList = {}, ignored = []) => {
    const copyQueue = [];
    Object.keys(copyList).forEach((targetPath) => {
        const sources = copyList[targetPath];
        sources.forEach((sourcePath) => {
            const stat = fs_1.default.statSync(sourcePath);
            if (stat.isDirectory()) {
                // If sourcePath is a directory, collect all files recursively
                const allFiles = collectFiles(sourcePath);
                allFiles.forEach((file) => {
                    const relativePath = path_1.default.relative(sourcePath, file);
                    const targetFilePath = path_1.default.join(targetPath, relativePath);
                    const targetFileDir = path_1.default.dirname(targetFilePath);
                    // Ensure the target directory exists
                    if (!fs_1.default.existsSync(targetFileDir)) {
                        fs_1.default.mkdirSync(targetFileDir, { recursive: true });
                    }
                    // Check if the file already exists in the target location
                    if (fs_1.default.existsSync(targetFilePath)) {
                        fs_1.default.unlinkSync(targetFilePath);
                    }
                    // Add to copy queue
                    copyQueue.push({ from: file, to: targetFilePath });
                });
            }
            else {
                // If sourcePath is not a directory, proceed as before
                const fileName = path_1.default.basename(sourcePath);
                const targetFilePath = path_1.default.join(targetPath, fileName);
                // Check if the file already exists in the target location
                if (fs_1.default.existsSync(targetFilePath)) {
                    fs_1.default.unlinkSync(targetFilePath);
                }
                // Add to copy queue
                copyQueue.push({ from: sourcePath, to: targetFilePath });
            }
        });
    });
    copyQueue.forEach((copyset) => {
        if (fs_1.default.existsSync(copyset.to)) {
            fs_1.default.unlinkSync(copyset.to);
        }
        const isIgnored = ignored.some((regex) => regex.test(copyset.from));
        if (!isIgnored) {
            fs_1.default.copyFileSync(copyset.from, copyset.to);
        }
        else {
            console.log(`Skipping copy of "${chalk_1.default.yellowBright(copyset.from)}" as it matches the ignore list.`);
        }
    });
    Object.keys(copyList).forEach((targetPath) => {
        const sources = copyList[targetPath];
        sources.forEach((sourcePath) => {
            console.log(`${chalk_1.default.yellow('[RWS]')} Copied "${chalk_1.default.blue(sourcePath)}" to "${chalk_1.default.blue(targetPath)}"`);
        });
    });
};
exports.copyFiles = copyFiles;
//# sourceMappingURL=fs.js.map