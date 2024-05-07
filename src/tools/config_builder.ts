import * as fs from 'fs';
import * as json5 from 'json5';
import chalk from 'chalk';


import { RWSCfgStorage } from '../helpers/_storage';

class ConfigBuilder<ICFG extends {[key: string]: any}> { 
    cfgData: ICFG;   
    constructor(filePath: string, private _DEFAULT_CONFIG: ICFG) {
        this.cfgData = this.readConfigFile(filePath);
    }

    readConfigFile(filePath: string): ICFG | null {
        if (!fs.existsSync(filePath)) {            
            return this._DEFAULT_CONFIG;
        }        

        const fileConfig: ICFG = json5.parse(fs.readFileSync(filePath, 'utf-8'));
        console.log(chalk.yellow('.rws.json config file detected. Config override:'), fileConfig);

        return {
            ...fileConfig,
        };
    }

    set(key: string, value: any): any {
        this._init();

        return RWSCfgStorage.set(key, value);
    }

    get(key: string, defaultPassedValue: any = null): any {
        this._init();

        let theValue = Object.keys(this._DEFAULT_CONFIG).includes(key) ? this._DEFAULT_CONFIG[key] : null;

        const storageValue = RWSCfgStorage.get(key);

        if(storageValue !== null){
            theValue = storageValue;            
        }else if(defaultPassedValue !== null){
            theValue = defaultPassedValue;
        }                                                                 

        return theValue;
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