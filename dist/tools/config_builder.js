"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigBuilder = void 0;
const fs = __importStar(require("fs"));
const json5 = __importStar(require("json5"));
const chalk_1 = __importDefault(require("chalk"));
const _storage_1 = require("../helpers/_storage");
class ConfigBuilder {
    constructor(filePath, _DEFAULT_CONFIG) {
        this._DEFAULT_CONFIG = _DEFAULT_CONFIG;
        this.cfgData = this.readConfigFile(filePath);
    }
    readConfigFile(filePath) {
        if (!fs.existsSync(filePath)) {
            return this._DEFAULT_CONFIG;
        }
        const fileConfig = json5.parse(fs.readFileSync(filePath, 'utf-8'));
        console.log(chalk_1.default.yellow('.rws.json config file detected. Config override:'), fileConfig);
        return {
            ...fileConfig,
        };
    }
    set(key, value) {
        this._init();
        return _storage_1.RWSCfgStorage.set(key, value);
    }
    get(key, defaultPassedValue = null) {
        this._init();
        let theValue = Object.keys(this._DEFAULT_CONFIG).includes(key) ? this._DEFAULT_CONFIG[key] : null;
        const storageValue = _storage_1.RWSCfgStorage.get(key);
        if (storageValue !== null) {
            theValue = storageValue;
        }
        else if (defaultPassedValue !== null) {
            theValue = defaultPassedValue;
        }
        return theValue;
    }
    exportDefaultConfig() {
        return this._DEFAULT_CONFIG;
    }
    exportBuildConfig() {
        this._init();
        return _storage_1.RWSCfgStorage.getAll();
    }
    _init() {
        if (!_storage_1.RWSCfgStorage.isLoaded()) {
            _storage_1.RWSCfgStorage.init(this.cfgData);
        }
    }
}
exports.ConfigBuilder = ConfigBuilder;
//# sourceMappingURL=config_builder.js.map