const RWSConsole = require('../../dist/index');
const RWSManagedConsole = RWSConsole.RWSManagedConsole;
const { runCommand } = RWSConsole.rwsShell;
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const { v4 } = require('uuid');


const uuid = v4;
const rwsLog = console.log;
const { copyFiles } = RWSConsole.rwsFS;
const rwsError = console.error;

module.exports = async function (output) {    
    const program = output.program;
    const commandOptions = output.options;
    const command = output.command;    
    const commandArgs = output.rawArgs || [];    

    if (!commandArgs.length) {
        throw new Error('Command args needed');
    }    

    if (!Object.keys(commandOptions).length) {
        throw new Error('Command opts needed');
    }    

    console.log(chalk.blue('PARSED COMMAND:'), command);
    console.log(chalk.yellow('Command args: '), commandArgs,output.args);
    console.log(chalk.yellow('Command options: '), commandOptions);

    return program;
}