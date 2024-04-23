declare class ConfigBuilder<ICFG> {
    private _DEFAULT_CONFIG;
    cfgData: ICFG;
    constructor(filePath: string, _DEFAULT_CONFIG: ICFG);
    readConfigFile(filePath: string): ICFG;
    get(key: string): any;
    exportDefaultConfig(): ICFG;
    exportBuildConfig(): ICFG;
    _init(): void;
}
export { ConfigBuilder };
