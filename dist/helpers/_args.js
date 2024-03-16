"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const path_2 = require("../tools/path");
exports.default = (procArgs) => {
    let command2map = procArgs[2];
    let args = procArgs[3] || '';
    const extraArgsAggregated = [];
    if (process.argv.length > 4) {
        for (let i = 4; i <= process.argv.length - 1; i++) {
            extraArgsAggregated.push(process.argv[i]);
        }
    }
    const totalMemoryBytes = os_1.default.totalmem();
    const totalMemoryKB = totalMemoryBytes / 1024;
    const totalMemoryMB = totalMemoryKB / 1024;
    const totalMemoryGB = totalMemoryMB / 1024;
    const webpackPath = path_1.default.resolve(__dirname, '..');
    const packageRootDir = (0, path_2.findRootWorkspacePath)(process.cwd());
    const moduleCfgDir = `${packageRootDir}/node_modules/.rws`;
    if (!command2map) {
        command2map = 'init';
    }
    if (args && extraArgsAggregated.length) {
        args = [args, ...extraArgsAggregated];
    }
    else if (args && typeof args === 'string') {
        args = [args];
    }
    return {
        command: command2map,
        args: args,
        moduleCfgDir,
        webpackPath,
        packageRootDir,
        totalMemoryMB,
        totalMemoryGB
    };
};
//# sourceMappingURL=_args.js.map