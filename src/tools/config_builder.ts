import * as fs from 'fs';
import * as json5 from 'json5';



import { RWSCfgStorage } from '../helpers/_storage';

class ConfigBuilder<ICFG> { 
    cfgData: ICFG;   
    constructor(filePath: string, private _DEFAULT_CONFIG: ICFG) {
        this.cfgData = this.readConfigFile(filePath);
    }

    readConfigFile(filePath: string): ICFG {
        if (!fs.existsSync(filePath)) {
            return this._DEFAULT_CONFIG;
        }

        const fileConfig: ICFG = json5.parse(fs.readFileSync(filePath, 'utf-8'));

        return {
            ...fileConfig,
        };
    }

    set(key: string, value: any): any {
        this._init();

        return RWSCfgStorage.set(key, value);
    }

    get(key: string): any {
        this._init();

        return RWSCfgStorage.get(key);
    }

    exportDefaultConfig(): ICFG {
        return this._DEFAULT_CONFIG;
    }

    exportBuildConfig(): ICFG {
        this._init();

        return RWSCfgStorage.getAll() as ICFG;
    }

    _init(): void {
        if (!RWSCfgStorage.isLoaded()) {
            RWSCfgStorage.init(this.cfgData as any);
        }
    }
}



export { ConfigBuilder };