import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import config from '../utils/config';

export const configCommand = new Command('config')
  .description('Gère la configuration globale du CLI');

configCommand
  .command('set <key> <value>')
  .description('Définit une valeur de configuration (ex: local.knimePath)')
  .action((key: string, value: string) => {
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
  .action((key: string) => {
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
    const table = new Table({
      head: [chalk.blue('Clé'), chalk.blue('Valeur')]
    });

    const store = (config as any).store;
    
    const flatten = (obj: any, prefix = '') => {
      let entries: [string, string][] = [];
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          entries = entries.concat(flatten(value, fullKey));
        } else {
          entries.push([fullKey, JSON.stringify(value)]);
        }
      }
      return entries;
    };

    flatten(store).forEach(([k, v]) => {
      table.push([chalk.cyan(k), v]);
    });

    console.log(chalk.bold('\n=== Configuration Globale ==='));
    console.log(table.toString());
    console.log('');
  });

configCommand
  .command('delete <key>')
  .description('Supprime une clé de configuration')
  .action((key: string) => {
    config.delete(key as any);
    console.log(chalk.yellow(`🗑️  ${key} supprimé.`));
  });
