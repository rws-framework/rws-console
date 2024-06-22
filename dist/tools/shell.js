"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCommand = runCommand;
const child_process_1 = require("child_process");
async function runCommand(command, cwd = null, silent = false) {
    return new Promise((resolve, reject) => {
        const [cmd, ...args] = command.split(' ');
        if (!cwd) {
            console.log(`[RWS] Setting default CWD for "${command}"`);
            cwd = process.cwd();
        }
        console.log(`[RWS] Running command "${command}" from "${cwd}"`);
        const spawned = (0, child_process_1.spawn)(cmd, args, { stdio: silent ? 'ignore' : 'inherit', cwd });
        spawned.on('exit', (code) => {
            if (code !== 0) {
                return reject(new Error(`Command failed with exit code ${code}`));
            }
            resolve();
        });
        spawned.on('error', (error) => {
            reject(error);
        });
    });
}
//# sourceMappingURL=shell.js.map