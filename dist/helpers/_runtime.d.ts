interface IRWSRuntimeHelper {
    _startTime: [number, number] | null;
    startExecTimeRecord: () => void;
    endExecTimeRecord: () => number;
    getRWSVar: (fileName: string) => string | null;
    setRWSVar: (fileName: string, value: string) => void;
    removeRWSVar: (fileName: string) => string | null;
}
declare const RWSRuntimeHelper: IRWSRuntimeHelper;
export { RWSRuntimeHelper, IRWSRuntimeHelper };
