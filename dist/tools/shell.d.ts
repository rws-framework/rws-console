interface CMDOpts {
    env?: any;
}
export declare function runCommand(command: string, cwd?: string | null, silent?: boolean, options?: CMDOpts): Promise<void>;
export {};
