import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { getWorkflowMetadata } from '../utils/workflow';

export const docCommand = new Command('doc')
  .description('Génère une documentation Markdown et un diagramme Mermaid du workflow')
  .requiredOption('-w, --workflow <name>', 'Nom du workflow')
  .option('-p, --path <path>', 'Chemin du dossier contenant le workflow', '.')
  .option('-o, --output <file>', 'Fichier de sortie (default: README.md dans le dossier du workflow)')
  .action(async (options: any) => {
    try {
      const metadata = await getWorkflowMetadata(options.workflow, options.path);
      
      let markdown = `# Workflow : ${metadata.name}\n\n`;
      markdown += `> **Auteur** : ${metadata.author}  \n`;
      markdown += `> **Version** : ${metadata.version}  \n\n`;
      
      if (metadata.description) {
        markdown += `## Description\n${metadata.description}\n\n`;
      }

      if (metadata.annotations && metadata.annotations.length > 0) {
        markdown += `## Documentation (Annotations)\n`;
        metadata.annotations.forEach(ann => {
          markdown += `> ${ann}\n\n`;
        });
      }

      markdown += `## Diagramme de Flux\n\n`;
      markdown += `\`\`\`mermaid\ngraph LR\n`;

      // Définir les nœuds dans Mermaid
      metadata.nodes.forEach(node => {
        // Nettoyer le nom pour Mermaid
        const cleanName = node.name.replace(/["()]/g, '');
        markdown += `    Node${node.id}["${cleanName} (#${node.id})"]\n`;
      });

      // Définir les connexions
      metadata.connections.forEach(conn => {
        markdown += `    Node${conn.sourceID} --> Node${conn.destID}\n`;
      });

      markdown += `\`\`\`\n\n`;

      markdown += `## Liste des Nœuds\n\n`;
      metadata.nodes.forEach(node => {
        markdown += `- **#${node.id}** : ${node.name}\n`;
      });

      const outputPath = options.output || path.join(options.path, options.workflow, 'README.md');
      fs.writeFileSync(outputPath, markdown, { encoding: 'utf8' });

      console.log(chalk.green(`\n✅ Documentation générée avec succès : ${chalk.bold(outputPath)}`));
      console.log(chalk.blue(`💡 Vous pouvez visualiser le diagramme sur : https://mermaid.live`));

    } catch (err: any) {
      console.error(chalk.red(`❌ Erreur : ${err.message}`));
      process.exit(1);
    }
  });
