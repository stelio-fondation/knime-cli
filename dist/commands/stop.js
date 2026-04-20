"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopCommand = void 0;
const commander_1 = require("commander");
const registry_1 = require("../utils/registry");
exports.stopCommand = new commander_1.Command('stop')
    .description('Arrête une exécution KNIME en cours')
    .option('-i, --execution-id <id>', 'PID de l\'exécution à arrêter')
    .option('-a, --all', 'Arrêter toutes les exécutions en cours')
    .action(async (options) => {
    const executions = (0, registry_1.getExecutions)();
    if (executions.length === 0) {
        console.log('No active executions to stop.');
        return;
    }
    const toStop = options.all
        ? executions.filter(e => e.status === 'running')
        : executions.filter(e => e.pid.toString() === options.executionId);
    if (toStop.length === 0) {
        console.log(`No running execution found with ID: ${options.executionId}`);
        return;
    }
    toStop.forEach(e => {
        try {
            console.log(`Stopping execution ${e.pid} (${e.workflow})...`);
            process.kill(e.pid, 'SIGTERM');
            (0, registry_1.removeExecution)(e.pid);
            console.log(`✅ Execution ${e.pid} stopped.`);
        }
        catch (err) {
            if (err.code === 'ESRCH') {
                console.warn(`[Warning] Process ${e.pid} already terminated.`);
                (0, registry_1.removeExecution)(e.pid);
            }
            else {
                console.error(`❌ Failed to stop execution ${e.pid}: ${err.message}`);
            }
        }
    });
});
//# sourceMappingURL=stop.js.map