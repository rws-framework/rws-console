declare class ConfigBuilder<ICFG extends {
    [key: string]: any;
}> {
    private _DEFAULT_CONFIG;
    cfgData: ICFG;
    constructor(filePath: string, _DEFAULT_CONFIG: ICFG);
    readConfigFile(filePath: string): ICFG | null;
    set(key: string, value: any): any;
    get(key: string, defaultPassedValue?: any): any;
    exportDefaultConfig(): ICFG;
    exportBuildConfig(): ICFG;
    _init(): void;
}
export { ConfigBuilder };
