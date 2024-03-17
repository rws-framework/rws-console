import * as rwsShell from './tools/shell';
import * as rwsPath from './tools/path';
import * as rwsFS from './tools/fs';
import rwsArgsHelper from './helpers/_run';
import { RWSManagedConsole, loadAction, bootstrap, RWSCliBootstrap } from './helpers/_managed_console';
declare const rwsCli: {
    loadAction: typeof loadAction;
    bootstrap: typeof bootstrap;
    RWSCliBootstrap: typeof RWSCliBootstrap;
};
export { rwsShell, rwsPath, rwsFS, RWSManagedConsole, rwsArgsHelper, rwsCli };
export default rwsCli;
