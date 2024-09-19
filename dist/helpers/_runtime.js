"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RWSRuntimeHelper = void 0;
const __1 = require("../");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
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
        const moduleCfgDir = this.getRwsConfigDir();
        if (!fs_1.default.existsSync(`${moduleCfgDir}/${fileName}`)) {
            return;
        }
        fs_1.default.unlinkSync(`${moduleCfgDir}/${fileName}`);
    },
    getRwsConfigDir() {
        const packageDir = __1.rwsPath.findRootWorkspacePath(process.cwd());
        return `${packageDir}/node_modules/.rws`;
    },
    createDirsInPath(filePath) {
        const dirPath = path_1.default.dirname(filePath);
        if (!fs_1.default.existsSync(dirPath)) {
            fs_1.default.mkdirSync(dirPath, { recursive: true });
        }
    },
    getRWSVar(fileName) {
        const moduleCfgDir = this.getRwsConfigDir();
        if (!fs_1.default.existsSync(`${moduleCfgDir}/${fileName}`)) {
            return null;
        }
        try {
            return fs_1.default.readFileSync(`${moduleCfgDir}/${fileName}`, 'utf-8');
        }
        catch (e) {
            return null;
        }
    },
    setRWSVar(fileName, value) {
        const moduleCfgDir = this.getRwsConfigDir();
        const fullPath = `${moduleCfgDir}/${fileName}`;
        if (!fs_1.default.existsSync(fullPath)) {
            this.createDirsInPath(fullPath);
        }
        fs_1.default.writeFileSync(fullPath, value);
    }
};
exports.RWSRuntimeHelper = RWSRuntimeHelper;
//# sourceMappingURL=_runtime.js.map