"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const cli_table3_1 = __importDefault(require("cli-table3"));
const registry_1 = require("../utils/registry");
exports.statusCommand = new commander_1.Command('status')
    .description('Affiche le statut des exécutions KNIME en cours')
    .action(async () => {
    const executions = (0, registry_1.getExecutions)();
    if (executions.length === 0) {
        console.log(chalk_1.default.yellow('\nNo active or recorded executions found.'));
        return;
    }
    const table = new cli_table3_1.default({
        head: [
            chalk_1.default.blue('PID'),
            chalk_1.default.blue('Workflow'),
            chalk_1.default.blue('Start Time'),
            chalk_1.default.blue('Status')
        ]
    });
    executions.forEach(e => {
        let isAlive = false;
        try {
            process.kill(e.pid, 0);
            isAlive = true;
        }
        catch (err) {
            isAlive = false;
        }
        if (!isAlive && e.status === 'running') {
            (0, registry_1.removeExecution)(e.pid);
            return;
        }
        table.push([
            e.pid.toString(),
            e.workflow,
            new Date(e.startTime).toLocaleString(),
            e.status === 'running' ? chalk_1.default.green(e.status) : chalk_1.default.yellow(e.status)
        ]);
    });
    if (table.length === 0) {
        console.log(chalk_1.default.yellow('\nNo active executions found after cleanup.'));
        return;
    }
    console.log(chalk_1.default.bold('\n=== Active KNIME Executions ==='));
    console.log(table.toString());
    console.log('');
});
//# sourceMappingURL=status.js.map