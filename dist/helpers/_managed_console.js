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
exports.RWSCliBootstrap = exports.RWSManagedConsole = void 0;
exports.loadAction = loadAction;
exports.bootstrap = bootstrap;
const readline = __importStar(require("readline"));
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const _run_1 = __importDefault(require("./_run"));
exports.RWSManagedConsole = {
    _askForYn: async function (question, rl) {
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
    },
    _askFor: async function (question, defaultVal = null, parser = (...args) => args[0], yN = true) {
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
                    const ynResult = await exports.RWSManagedConsole._askForYn('Do you want to set "' + question + '"?', rl);
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
};
async function loadAction(actionName, actionsDir) {
    return (await Promise.resolve(`${path_1.default.resolve(`${actionsDir}/${actionName}Action.js`)}`).then(s => __importStar(require(s)))).default;
}
class RWSCliBootstrap {
    constructor(actions, actionsDir) {
        this.actions = actions;
        this.actionsDir = actionsDir;
    }
    async run(runOpts) {
        if (!Object.keys(this.actions).includes(`${process.argv[2]}`) && !runOpts.proxy) {
            console.error(`No command executor "${process.argv[2]}" is defined`);
            return;
        }
        return await (0, _run_1.default)(this.actions[runOpts.proxy ? 'proxy' : process.argv[2]], runOpts);
    }
}
exports.RWSCliBootstrap = RWSCliBootstrap;
function bootstrap(actions, actionsDir) {
    if (!actionsDir || !actions || !actions.length) {
        console.trace(chalk_1.default.red('Bootstrap needs "actions" string array (at least one defined), and "actionsDir" (string path) parameters'));
        return;
    }
    const actionsToLoad = {};
    actions.forEach((act) => {
        actionsToLoad[act] = loadAction(act, actionsDir);
    });
    return new RWSCliBootstrap(actionsToLoad, actionsDir);
}
//# sourceMappingURL=_managed_console.js.map