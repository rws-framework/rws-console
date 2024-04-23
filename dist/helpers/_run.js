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
    const program = commander_1.program;
    let theArgs = (argsOpts === null || argsOpts === void 0 ? void 0 : argsOpts.args) || [];
    const programCommand = program.command(`${process.argv[2]} ${(theArgs.map(it => `<${it}>`) || []).join(' ')}`); // Capture variadic arguments for the command
    for (const opt of (argsOpts === null || argsOpts === void 0 ? void 0 : argsOpts.options) || []) {
        programCommand.option(`-${opt.short}, --${opt.long} <opt-value>`, opt.desc, opt.parseArg, opt.defaultValue);
    }
    for (const opt of (argsOpts === null || argsOpts === void 0 ? void 0 : argsOpts.args) || []) {
        //args
    }
    const options = {};
    const totalMemoryBytes = os_1.default.totalmem();
    const totalMemoryMB = totalMemoryBytes / 1024 / 1024;
    const totalMemoryGB = totalMemoryMB / 1024;
    let webpackPath;
    let moduleCfgDir;
    const parsedOpts = {
        command: process.argv[2],
        program,
        args: {},
        moduleCfgDir,
        webpackPath,
        totalMemoryMB,
        totalMemoryGB,
        options,
        rawArgs: []
    };
    programCommand.action(async (...actionArgs) => {
        parsedOpts.webpackPath = path_1.default.resolve(__dirname, '..');
        parsedOpts.moduleCfgDir = `${(0, path_2.findRootWorkspacePath)(process.cwd())}/node_modules/.rws`;
        parsedOpts.options = programCommand.opts();
        const filteredArgs = actionArgs.filter((v, index) => (index < actionArgs.length - 1) && typeof v === 'string') || [];
        const parsedArgs = {};
        for (const i in filteredArgs) {
            parsedArgs[argsOpts.args[i]] = filteredArgs[i];
        }
        parsedOpts.args = parsedArgs;
        parsedOpts.rawArgs = filteredArgs;
    });
    program.parse(process.argv);
    return (await action)(parsedOpts);
};
exports.default = runCmd;
//# sourceMappingURL=_run.js.map