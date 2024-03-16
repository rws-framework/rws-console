"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArgs = exports.RWSManagedConsole = void 0;
const readline = __importStar(require("readline"));
const chalk_1 = __importDefault(require("chalk"));
const _args_1 = __importDefault(require("../helpers/_args"));
exports.getArgs = _args_1.default;
class RWSManagedConsole {
    static async _askForYn(question, rl) {
        return new Promise((yNResolve) => {
            if (!rl) {
                rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout,
                });
            }
            rl.question(question + ' (y/n): ', (answer) => {
                if (answer === 'y') {
                    yNResolve(true); // Resolved positively
                }
                else {
                    yNResolve(false); // Immediate resolve for "no" answer
                    if (rl) {
                        rl.close();
                    }
                }
            });
        });
    }
    static async _askFor(question, defaultVal = null, parser = (txt) => txt, yN = true) {
        return new Promise((resolve) => {
            (async () => {
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout,
                });
                const questionAsked = () => {
                    rl.question(question + ': ', (answer) => {
                        resolve(parser(answer));
                        rl.close();
                    });
                };
                if (yN) {
                    const ynResult = await this._askForYn('Do you want to set "' + question + '"?', rl);
                    if (!ynResult) {
                        console.log(chalk_1.default.red('Canceled'));
                        rl.close();
                        resolve(defaultVal);
                        return;
                    }
                }
                questionAsked();
            })();
        });
    }
}
exports.RWSManagedConsole = RWSManagedConsole;
//# sourceMappingURL=_managed_console.js.map