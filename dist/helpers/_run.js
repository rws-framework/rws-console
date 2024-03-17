"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const path_2 = require("../tools/path");
const runCmd = async (action, argsOpts = {}) => {
    var _a;
    const program = commander_1.program;
    const programCommand = program.command(`${process.argv[2]} ${(((_a = argsOpts === null || argsOpts === void 0 ? void 0 : argsOpts.args) === null || _a === void 0 ? void 0 : _a.map(it => `<${it}>`)) || []).join(' ')}`); // Capture variadic arguments for the command
    for (const opt of (argsOpts === null || argsOpts === void 0 ? void 0 : argsOpts.options) || []) {
        programCommand.option(`-${opt.short}, --${opt.long} <opt-value>`, opt.desc);
    }
    for (const opt of (argsOpts === null || argsOpts === void 0 ? void 0 : argsOpts.args) || []) {
        //args
    }
    const options = {};
    let args;
    const totalMemoryBytes = os_1.default.totalmem();
    const totalMemoryMB = totalMemoryBytes / 1024 / 1024;
    const totalMemoryGB = totalMemoryMB / 1024;
    let webpackPath;
    let moduleCfgDir;
    const parsedOpts = {
        command: process.argv[2],
        program,
        args: args,
        moduleCfgDir,
        webpackPath,
        totalMemoryMB,
        totalMemoryGB,
        options
    };
    programCommand.action(async (...actionArgs) => {
        parsedOpts.webpackPath = path_1.default.resolve(__dirname, '..');
        parsedOpts.moduleCfgDir = `${(0, path_2.findRootWorkspacePath)(process.cwd())}/node_modules/.rws`;
        parsedOpts.options = programCommand.opts();
        parsedOpts.args = actionArgs.filter((v, index) => (index < actionArgs.length - 1) && typeof v === 'string') || [];
    });
    program.parse(process.argv);
    return (await action)(parsedOpts);
};
exports.default = runCmd;
//# sourceMappingURL=_run.js.map