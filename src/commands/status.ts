import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { getExecutions, removeExecution } from '../utils/registry';

export const statusCommand = new Command('status')
  .description('Affiche le statut des exécutions KNIME en cours')
  .action(async () => {
    const executions = getExecutions();

    if (executions.length === 0) {
      console.log(chalk.yellow('\nNo active or recorded executions found.'));
      return;
    }

    const table = new Table({
      head: [
        chalk.blue('PID'), 
        chalk.blue('Workflow'), 
        chalk.blue('Start Time'), 
        chalk.blue('Status')
      ]
    });

    executions.forEach(e => {
      let isAlive = false;
      try {
        process.kill(e.pid, 0);
        isAlive = true;
      } catch (err) {
        isAlive = false;
      }

      if (!isAlive && e.status === 'running') {
        removeExecution(e.pid);
        return;
      }

      table.push([
        e.pid.toString(),
        e.workflow,
        new Date(e.startTime).toLocaleString(),
        e.status === 'running' ? chalk.green(e.status) : chalk.yellow(e.status)
      ]);
    });

    if (table.length === 0) {
      console.log(chalk.yellow('\nNo active executions found after cleanup.'));
      return;
    }

    console.log(chalk.bold('\n=== Active KNIME Executions ==='));
    console.log(table.toString());
    console.log('');
  });