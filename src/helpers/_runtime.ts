import { rwsPath } from '../';
import fs from 'fs';

interface IRWSRuntimeHelper {    
        _startTime: [number, number] | null;
        startExecTimeRecord: () => void;
        endExecTimeRecord: () => number;
        getRWSVar: (fileName: string) => string | null;
        setRWSVar: (fileName: string, value: string) => void;
        removeRWSVar: (fileName: string) => string | null;
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
        const packageDir = rwsPath.findRootWorkspacePath(process.cwd());    
        const moduleCfgDir = `${packageDir}/node_modules/.rws`;

        if(!fs.existsSync(`${moduleCfgDir}/${fileName}`)){
            return;
        }

        fs.unlinkSync(`${moduleCfgDir}/${fileName}`);
    },
    getRWSVar(fileName: string): string | null
    {
        const packageDir = rwsPath.findRootWorkspacePath(process.cwd());    
        const moduleCfgDir = `${packageDir}/node_modules/.rws`;

        if(!fs.existsSync(`${moduleCfgDir}/${fileName}`)){
            return;
        }

        try{
            return fs.readFileSync(`${moduleCfgDir}/${fileName}`, 'utf-8');
        } catch (e: any){
            return null;
        }
    },   
    setRWSVar(fileName: string, value: string)
    {
        const packageDir = rwsPath.findRootWorkspacePath(process.cwd());    
        const moduleCfgDir = `${packageDir}/node_modules/.rws`;

        if(!fs.existsSync(moduleCfgDir)){
            fs.mkdirSync(moduleCfgDir);
        }

        fs.writeFileSync(`${moduleCfgDir}/${fileName}`, value);
    }
}



export { RWSRuntimeHelper, IRWSRuntimeHelper };