"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCommand = runCommand;
const child_process_1 = require("child_process");
async function runCommand(command, cwd = null, silent = false, options = {}) {
    return new Promise((resolve, reject) => {
        if (!cwd) {
            if (!silent) {
                console.log(`[RWS] Setting default CWD for "${command}"`);
            }
            cwd = process.cwd();
        }
        if (!silent) {
            console.log(`[RWS] Running command "${command}" from "${cwd}"`);
        }
        const isWindows = process.platform === 'win32';
        const spawnOptions = {
            stdio: silent ? 'ignore' : 'inherit',
            cwd,
            env: options === null || options === void 0 ? void 0 : options.env,
            ...(isWindows ? {
                shell: true,
                windowsVerbatimArguments: true
            } : {})
        };
        const spawned = isWindows
            ? (0, child_process_1.spawn)(command, [], spawnOptions)
            : (0, child_process_1.spawn)(command.split(' ')[0], command.split(' ').slice(1), spawnOptions);
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