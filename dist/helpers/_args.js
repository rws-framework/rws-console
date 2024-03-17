"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const path_2 = require("../tools/path");
const runCmd = (argsOpts = {}) => {
    const cmd = commander_1.program.command(`${process.argv[2]} <a1> <a2> <a3>`); // Capture variadic arguments for the command
    for (const opt of (argsOpts === null || argsOpts === void 0 ? void 0 : argsOpts.options) || []) {
        cmd.option(`-${opt.short}, --${opt.long} <opt-value>`, opt.desc);
    }
    for (const opt of (argsOpts === null || argsOpts === void 0 ? void 0 : argsOpts.args) || []) {
        //args
    }
    let command2map;
    cmd.action((cmd) => {
        command2map = cmd;
    });
    cmd.parse(process.argv);
    const options = cmd.opts();
    let args = cmd.args.filter((v, index) => index > 0) || [];
    console.log(command2map, options, args);
    const totalMemoryBytes = os_1.default.totalmem();
    const totalMemoryMB = totalMemoryBytes / 1024 / 1024;
    const totalMemoryGB = totalMemoryMB / 1024;
    const webpackPath = path_1.default.resolve(__dirname, '..');
    const packageRootDir = (0, path_2.findRootWorkspacePath)(process.cwd());
    const moduleCfgDir = `${packageRootDir}/node_modules/.rws`;
    return {
        command: command2map,
        program: cmd,
        args: args,
        moduleCfgDir,
        webpackPath,
        packageRootDir,
        totalMemoryMB,
        totalMemoryGB
    };
};
exports.default = runCmd;
//# sourceMappingURL=_args.js.map