import { Command } from 'commander';

export const validateCommand = new Command('validate')
  .description('Valide la structure dun workflow KNIME')
  .requiredOption('-w, --workflow <name>', 'Nom du workflow')
  .option('-p, --path <path>', 'Chemin du fichier knwf', '.')
  .action(async (options) => {
    console.log('validate', options);
  });