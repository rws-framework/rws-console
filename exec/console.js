#!/usr/bin/env node

const RWSConsole = require('../dist/index');
const path = require('path');
const rwsError = console.error;
const rwsLog = console.log;
const getArgs = RWSConsole.rwsArgsHelper;

const bootstrap = RWSConsole.rwsCli.bootstrap(['test'], __dirname + '/actions');

(async () => {
    await bootstrap.run({
        options: [{
            short: 'o1',
            long: 'option1'
        }],
        args: ['X']
    });
})()
