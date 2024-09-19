import chalk from 'chalk';
import { rwsPath } from '../';
import fs from 'fs';
import path from 'path';

interface IRWSRuntimeHelper {    
        _startTime: [number, number] | null;
        startExecTimeRecord: () => void;
        endExecTimeRecord: () => number;
        getRWSVar: (fileName: string) => string | null;
        setRWSVar: (fileName: string, value: string) => void;
        removeRWSVar: (fileName: string) => string | null;
        getRwsConfigDir: () => string;
        createDirsInPath: (filePath: string) => void;
};

const RWSRuntimeHelper: IRWSRuntimeHelper = {
    _startTime: null,
    startExecTimeRecord()
    {
        this._startTime = process.hrtime() ;
    },
    endExecTimeRecord(): number
    {

        if(this._startTime === null){
            return 0;
        }

        const elapsed = process.hrtime(this._startTime);   
    
        this._startTime = null;

        return Math.round(elapsed[0] * 1000 + elapsed[1] / 1e6);
    },
    removeRWSVar(fileName: string): string | null
    {
        const moduleCfgDir = this.getRwsConfigDir();

        if(!fs.existsSync(`${moduleCfgDir}/${fileName}`)){
            return;
        }

        fs.unlinkSync(`${moduleCfgDir}/${fileName}`);
    },    
    getRwsConfigDir(): string
    {        
        const packageDir = rwsPath.findRootWorkspacePath(process.cwd());            
 
        return `${packageDir}/node_modules/.rws`;
    },
    createDirsInPath(filePath: string): void 
    {
        const dirPath = path.dirname(filePath);        
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });            
        }
    },
    getRWSVar(fileName: string): string | null
    {        
        const moduleCfgDir = this.getRwsConfigDir();
        
        if(!fs.existsSync(`${moduleCfgDir}/${fileName}`)){
            return null;
        }

        try{
            return fs.readFileSync(`${moduleCfgDir}/${fileName}`, 'utf-8');
        } catch (e: any){
            return null;
        }
    },   

    setRWSVar(fileName: string, value: string): void
    {    
        const moduleCfgDir = this.getRwsConfigDir();
        const fullPath = `${moduleCfgDir}/${fileName}`;

        if(!fs.existsSync(fullPath)){
            this.createDirsInPath(fullPath);
        }
        
        fs.writeFileSync(fullPath, value);
    }
}



export { RWSRuntimeHelper, IRWSRuntimeHelper };