import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { parseWorkflowMetadata } from '../utils/knime-parser';

export const lineageCommand = new Command('lineage')
  .description('Affiche le lignage des données (flux entre les nœuds)')
  .requiredOption('-w, --workflow <name>', 'Workflow à analyser')
  .option('-p, --path <path>', 'Chemin vers le dossier contenant le workflow', '.')
  .action((options) => {
    const workflowDir = path.join(options.path, options.workflow);
    const knimeFile = path.join(workflowDir, 'workflow.knime');

    if (!fs.existsSync(knimeFile)) {
      console.error(chalk.red(`Erreur : Fichier workflow.knime non trouvé dans ${workflowDir}`));
      process.exit(1);
    }

    const xmlData = fs.readFileSync(knimeFile, 'utf8');
    const meta = parseWorkflowMetadata(xmlData, options.workflow);

    console.log(chalk.blue.bold(`\n📊 Lignage des données pour : ${meta.name}\n`));
    
    if (meta.connections.length === 0) {
      console.log(chalk.yellow('  Aucune connexion trouvée.'));
      return;
    }

    meta.connections.forEach((conn, index) => {
      const srcNode = meta.nodes.find(n => n.id === conn.sourceID);
      const destNode = meta.nodes.find(n => n.id === conn.destID);
      
      const srcName = srcNode ? srcNode.name : `Node ${conn.sourceID}`;
      const destName = destNode ? destNode.name : `Node ${conn.destID}`;

      console.log(`  ${chalk.cyan(index + 1 + '.') } ${chalk.green(srcName)} (${conn.sourceID}) ${chalk.gray('-->')} ${chalk.yellow(destName)} (${conn.destID})`);
    });
    
    console.log('');
  });
