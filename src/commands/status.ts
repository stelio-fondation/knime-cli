import { Command } from 'commander';
import { getExecutions, removeExecution } from '../utils/registry';

export const statusCommand = new Command('status')
  .description('Affiche le statut des exécutions KNIME en cours')
  .action(async () => {
    const executions = getExecutions();

    if (executions.length === 0) {
      console.log('\nNo active or recorded executions found.');
      return;
    }

    console.log('\n=== Active KNIME Executions ===');
    console.log(`${'PID'.padEnd(10)} ${'Workflow'.padEnd(30)} ${'Start Time'.padEnd(25)} ${'Status'}`);
    console.log('-'.repeat(80));

    executions.forEach(e => {
      let isAlive = false;
      try {
        // Signal 0 vérifie si le processus existe sans le tuer
        process.kill(e.pid, 0);
        isAlive = true;
      } catch (err) {
        isAlive = false;
      }

      if (!isAlive && e.status === 'running') {
        // Le processus n'existe plus mais était marqué comme running
        // On pourrait le nettoyer ici ou le marquer comme 'unknown/terminated'
        removeExecution(e.pid);
        return;
      }

      console.log(`${e.pid.toString().padEnd(10)} ${e.workflow.padEnd(30)} ${new Date(e.startTime).toLocaleString().padEnd(25)} ${e.status}`);
    });
    console.log('');
  });