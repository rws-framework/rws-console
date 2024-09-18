interface IRWSRuntimeHelper {    
        _startTime: [number, number] | null;
        startExecTimeRecord: () => void;
        endExecTimeRecord: () => number;
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
    }
}



export { RWSRuntimeHelper, IRWSRuntimeHelper };