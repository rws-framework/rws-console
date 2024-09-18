interface IRWSRuntimeHelper {
    _startTime: [number, number] | null;
    startExecTimeRecord: () => void;
    endExecTimeRecord: () => number;
}
declare const RWSRuntimeHelper: IRWSRuntimeHelper;
export { RWSRuntimeHelper, IRWSRuntimeHelper };
