import { Command } from 'commander';

export const stopCommand = new Command('stop')
  .description('Arrete une execution en cours')
  .requiredOption('-i, --execution-id <id>', 'ID de execution a arreter')
  .action(async (options) => {
    console.log('stop', options);
  });