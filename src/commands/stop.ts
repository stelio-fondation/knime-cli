import { Command } from 'commander';
import { getExecutions, removeExecution } from '../utils/registry';

export const stopCommand = new Command('stop')
  .description('Arrête une exécution KNIME en cours')
  .option('-i, --execution-id <id>', 'PID de l\'exécution à arrêter')
  .option('-a, --all', 'Arrêter toutes les exécutions en cours')
  .action(async (options) => {
    const executions = getExecutions();

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
        removeExecution(e.pid);
        console.log(`✅ Execution ${e.pid} stopped.`);
      } catch (err: any) {
        if (err.code === 'ESRCH') {
          console.warn(`[Warning] Process ${e.pid} already terminated.`);
          removeExecution(e.pid);
        } else {
          console.error(`❌ Failed to stop execution ${e.pid}: ${err.message}`);
        }
      }
    });
  });