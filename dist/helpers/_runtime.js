"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RWSRuntimeHelper = void 0;
;
const RWSRuntimeHelper = {
    _startTime: null,
    startExecTimeRecord() {
        this._startTime = process.hrtime();
    },
    endExecTimeRecord() {
        if (this._startTime === null) {
            return 0;
        }
        const elapsed = process.hrtime(this._startTime);
        this._startTime = null;
        return Math.round(elapsed[0] * 1000 + elapsed[1] / 1e6);
    }
};
exports.RWSRuntimeHelper = RWSRuntimeHelper;
//# sourceMappingURL=_runtime.js.map