import { spawn } from 'child_process';

interface CMDOpts {
    env?: any
}

export async function runCommand(command: string, cwd: string | null = null, silent: boolean = false, options: CMDOpts = {}): Promise<void> {
    return new Promise((resolve, reject) => {
        const [cmd, ...args] = command.split(' ');

        if (!cwd) {
            if(!silent){
                console.log(`[RWS] Setting default CWD for "${command}"`);
            }

            cwd = process.cwd();
        }

        if(!silent){
            console.log(`[RWS] Running command "${command}" from "${cwd}"`);
        }

        const spawned = spawn(cmd, args, { stdio: silent ? 'ignore' : 'inherit', cwd, env: options?.env });

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