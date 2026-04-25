import { Command } from 'commander';
import chalk from 'chalk';
import { getWorkflowMetadata } from '../utils/workflow';

interface DiffOptions {
  w1: string;
  w2: string;
  path1?: string;
  path2?: string;
}

export const diffCommand = new Command('diff')
  .description('Compare deux workflows KNIME et affiche les différences structurelles')
  .requiredOption('--w1 <name>', 'Premier workflow')
  .requiredOption('--w2 <name>', 'Deuxième workflow')
  .option('--p1 <path>', 'Chemin du premier workflow', '.')
  .option('--p2 <path>', 'Chemin du deuxième workflow', '.')
  .action(async (options: any) => {
    try {
      console.log(chalk.bold(`\nComparing workflows...`));
      console.log(`${chalk.gray('W1:')} ${options.w1}`);
      console.log(`${chalk.gray('W2:')} ${options.w2}\n`);

      const meta1 = await getWorkflowMetadata(options.w1, options.p1);
      const meta2 = await getWorkflowMetadata(options.w2, options.p2);

      // 1. Comparaison des Nœuds
      console.log(chalk.bold.blue('=== Nodes Comparison ==='));
      
      const nodes1 = new Map(meta1.nodes.map(n => [n.id, n.name]));
      const nodes2 = new Map(meta2.nodes.map(n => [n.id, n.name]));

      const allIds = Array.from(new Set([...nodes1.keys(), ...nodes2.keys()])).sort((a, b) => parseInt(a) - parseInt(b));

      let hasNodeChanges = false;
      allIds.forEach(id => {
        const name1 = nodes1.get(id);
        const name2 = nodes2.get(id);

        if (!name1) {
          console.log(chalk.green(`  [+] Node ${id}: ${name2} (Added)`));
          hasNodeChanges = true;
        } else if (!name2) {
          console.log(chalk.red(`  [-] Node ${id}: ${name1} (Removed)`));
          hasNodeChanges = true;
        } else if (name1 !== name2) {
          console.log(chalk.yellow(`  [*] Node ${id}: ${name1} -> ${name2} (Renamed/Changed)`));
          hasNodeChanges = true;
        }
      });

      if (!hasNodeChanges) {
        console.log(chalk.gray('  No node changes detected.'));
      }

      // 2. Comparaison des Variables
      console.log(chalk.bold.blue('\n=== Variables Comparison ==='));
      const vars1 = new Map(meta1.variables.map(v => [v.name, v]));
      const vars2 = new Map(meta2.variables.map(v => [v.name, v]));

      const allVarNames = Array.from(new Set([...vars1.keys(), ...vars2.keys()])).sort();
      let hasVarChanges = false;

      allVarNames.forEach(name => {
        const v1 = vars1.get(name);
        const v2 = vars2.get(name);

        if (!v1) {
          console.log(chalk.green(`  [+] Variable ${name}: ${v2?.value} (Added)`));
          hasVarChanges = true;
        } else if (!v2) {
          console.log(chalk.red(`  [-] Variable ${name} (Removed)`));
          hasVarChanges = true;
        } else if (v1.value !== v2.value || v1.type !== v2.type) {
          console.log(chalk.yellow(`  [*] Variable ${name}: ${v1.value} -> ${v2.value} (${v1.type} -> ${v2.type})`));
          hasVarChanges = true;
        }
      });

      if (!hasVarChanges) {
        console.log(chalk.gray('  No variable changes detected.'));
      }

      console.log('');

    } catch (err: any) {
      console.error(chalk.red(`❌ Error during diff: ${err.message}`));
      process.exit(1);
    }
  });
