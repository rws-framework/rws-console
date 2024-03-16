import { spawn } from 'child_process';

export async function runCommand(command: string, cwd: string | null = null, silent: boolean = false): Promise<void> {
    return new Promise((resolve, reject) => {
        const [cmd, ...args] = command.split(' ');

        if (!cwd) {
            console.log(`[RWS] Setting default CWD for "${command}"`);
            cwd = process.cwd();
        }

        console.log(`[RWS] Running command "${command}" from "${cwd}"`);

        const spawned = spawn(cmd, args, { stdio: silent ? 'ignore' : 'inherit', cwd });

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