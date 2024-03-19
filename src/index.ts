import * as rwsShell from './tools/shell';
import * as rwsPath from './tools/path';
import * as rwsFS from './tools/fs';
import rwsArgsHelper, {RWSInputType}  from './helpers/_run';

import { RWSManagedConsole, loadAction, bootstrap, RWSCliBootstrap } from './helpers/_managed_console';

const rwsCli = {
    loadAction, bootstrap, RWSCliBootstrap
};

export {
    rwsShell,
    rwsPath,
    rwsFS,
    RWSManagedConsole,
    rwsArgsHelper,
    rwsCli,
    RWSInputType
};

export default rwsCli;