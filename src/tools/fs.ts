import fs from 'fs';
import chalk from 'chalk';
import path from 'path';

function collectFiles(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    files.forEach(file => {
        if (file.isDirectory()) {
            collectFiles(path.join(dir, file.name), fileList);
        } else {
            fileList.push(path.join(dir, file.name));
        }
    });
    return fileList;
}

export function removeDirectory(clearContents = false){
    
}

export const copyFiles = async (copyList: Record<string, string[]> = {}, ignored: RegExp[] = []): Promise<void> => {
    const copyQueue: { from: string; to: string }[] = [];

    Object.keys(copyList).forEach((targetPath) => {
        const sources = copyList[targetPath];
      
        sources.forEach((sourcePath) => {        
            const stat = fs.statSync(sourcePath);
            if (stat.isDirectory()) {
                // If sourcePath is a directory, collect all files recursively
                const allFiles = collectFiles(sourcePath);
                allFiles.forEach((file) => {
                    const relativePath = path.relative(sourcePath, file);
                    const targetFilePath = path.join(targetPath, relativePath);
                    const targetFileDir = path.dirname(targetFilePath);
    
                    // Ensure the target directory exists
                    if (!fs.existsSync(targetFileDir)) {
                        fs.mkdirSync(targetFileDir, { recursive: true });
                    }
    
                    // Check if the file already exists in the target location
                    if (fs.existsSync(targetFilePath)) {
                        fs.unlinkSync(targetFilePath);
                    }
    
                    // Add to copy queue
                    copyQueue.push({ from: file, to: targetFilePath });
                });
            } else {
                // If sourcePath is not a directory, proceed as before
                const fileName = path.basename(sourcePath);
                const targetFilePath = path.join(targetPath, fileName);
    
                // Check if the file already exists in the target location
                if (fs.existsSync(targetFilePath)) {
                    fs.unlinkSync(targetFilePath);
                }
    
                // Add to copy queue
                copyQueue.push({ from: sourcePath, to: targetFilePath });
            }
        });
    });

    copyQueue.forEach((copyset) => {
        if(fs.existsSync(copyset.to)){
            fs.unlinkSync(copyset.to);
        }        

        const isIgnored: boolean = ignored.some((regex) => regex.test(copyset.from));

        if (!isIgnored) {
            fs.copyFileSync(copyset.from, copyset.to);       

        }else{
            console.log(`Skipping copy of "${chalk.yellowBright(copyset.from)}" as it matches the ignore list.`);
        }
    });    

    Object.keys(copyList).forEach((targetPath) => {
        const sources = copyList[targetPath];      
        sources.forEach((sourcePath) => {
            console.log(`${chalk.yellow('[RWS]')} Copied "${chalk.blue(sourcePath)}" to "${chalk.blue(targetPath)}"`);
        });
    });
};
