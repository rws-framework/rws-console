import { spawn, SpawnOptions, StdioOptions } from 'child_process';

interface CMDOpts {
    env?: any
}

export async function runCommand(command: string, cwd: string | null = null, silent: boolean = false, options: CMDOpts = {}): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!cwd) {
            if(!silent){
                console.log(`[RWS] Setting default CWD for "${command}"`);
            }
            cwd = process.cwd();
        }

        if(!silent){
            console.log(`[RWS] Running command "${command}" from "${cwd}"`);
        }

        const isWindows = process.platform === 'win32';
        
        const spawnOptions: SpawnOptions = {
            stdio: silent ? 'ignore' : 'inherit' as StdioOptions,
            cwd,
            env: options?.env,
            ...(isWindows ? {
                shell: true,
                windowsVerbatimArguments: true
            } : {})
        };

        const spawned = isWindows 
            ? spawn(command, [], spawnOptions)
            : spawn(command.split(' ')[0], command.split(' ').slice(1), spawnOptions);

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