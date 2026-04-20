import { Command } from 'commander';
import chalk from 'chalk';
import config from '../utils/config';

export const configCommand = new Command('config')
  .description('Gère la configuration globale du CLI');

configCommand
  .command('set <key> <value>')
  .description('Définit une valeur de configuration (ex: local.knimePath)')
  .action((key, value) => {
    try {
      config.set(key, value);
      console.log(chalk.green(`✅ ${key} défini sur : ${value}`));
    } catch (err: any) {
      console.error(chalk.red(`❌ Erreur : ${err.message}`));
    }
  });

configCommand
  .command('get <key>')
  .description('Affiche une valeur de configuration')
  .action((key) => {
    const value = config.get(key);
    if (value !== undefined) {
      console.log(`${key}: ${chalk.cyan(JSON.stringify(value, null, 2))}`);
    } else {
      console.log(chalk.yellow(`⚠️  ${key} n'est pas défini.`));
    }
  });

configCommand
  .command('list')
  .description('Liste toute la configuration')
  .action(() => {
    console.log(chalk.bold('\n=== Configuration Globale ==='));
    console.log(JSON.stringify(config.store, null, 2));
    console.log('');
  });

configCommand
  .command('delete <key>')
  .description('Supprime une clé de configuration')
  .action((key) => {
    config.delete(key as any);
    console.log(chalk.yellow(`🗑️  ${key} supprimé.`));
  });
