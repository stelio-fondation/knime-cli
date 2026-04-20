import { Command } from 'commander';

export const statusCommand = new Command('status')
  .description('Affiche le statut execution dun workflow')
  .requiredOption('-i, --execution-id <id>', 'ID de execution')
  .action(async (options) => {
    console.log('status', options);
  });