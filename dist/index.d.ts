import * as rwsShell from './tools/shell';
import * as rwsPath from './tools/path';
import * as rwsFS from './tools/fs';
import { RWSManagedConsole } from './helpers/_managed_console';
declare const _default: {
    rwsShell: typeof rwsShell;
    rwsPath: typeof rwsPath;
    rwsFS: typeof rwsFS;
    RWSManagedConsole: typeof RWSManagedConsole;
    rwsArgsHelper: (procArgs: string[]) => import("./helpers/_args").IOutputArgs;
};
export default _default;
