"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RWSRuntimeHelper = void 0;
const __1 = require("../");
const fs_1 = __importDefault(require("fs"));
;
const RWSRuntimeHelper = {
    _startTime: null,
    startExecTimeRecord() {
        this._startTime = process.hrtime();
    },
    endExecTimeRecord() {
        if (this._startTime === null) {
            return 0;
        }
        const elapsed = process.hrtime(this._startTime);
        this._startTime = null;
        return Math.round(elapsed[0] * 1000 + elapsed[1] / 1e6);
    },
    removeRWSVar(fileName) {
        const packageDir = __1.rwsPath.findRootWorkspacePath(process.cwd());
        const moduleCfgDir = `${packageDir}/node_modules/.rws`;
        if (!fs_1.default.existsSync(`${moduleCfgDir}/${fileName}`)) {
            return;
        }
        fs_1.default.unlinkSync(`${moduleCfgDir}/${fileName}`);
    },
    getRWSVar(fileName) {
        const packageDir = __1.rwsPath.findRootWorkspacePath(process.cwd());
        const moduleCfgDir = `${packageDir}/node_modules/.rws`;
        if (!fs_1.default.existsSync(`${moduleCfgDir}/${fileName}`)) {
            return;
        }
        try {
            return fs_1.default.readFileSync(`${moduleCfgDir}/${fileName}`, 'utf-8');
        }
        catch (e) {
            return null;
        }
    },
    setRWSVar(fileName, value) {
        const packageDir = __1.rwsPath.findRootWorkspacePath(process.cwd());
        const moduleCfgDir = `${packageDir}/node_modules/.rws`;
        if (!fs_1.default.existsSync(moduleCfgDir)) {
            fs_1.default.mkdirSync(moduleCfgDir);
        }
        fs_1.default.writeFileSync(`${moduleCfgDir}/${fileName}`, value);
    }
};
exports.RWSRuntimeHelper = RWSRuntimeHelper;
//# sourceMappingURL=_runtime.js.map