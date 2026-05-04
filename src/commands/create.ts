import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

export const createCommand = new Command('create')
  .description('Initialise un nouveau workflow KNIME')
  .argument('<name>', 'Nom du workflow')
  .option('-p, --path <path>', 'Répertoire de destination', '.')
  .action((name, options) => {
    try {
      const wfPath = path.join(options.path, name);
      if (fs.existsSync(wfPath)) {
        console.error(chalk.red(`❌ Le dossier ${wfPath} existe déjà.`));
        process.exit(1);
      }

      fs.mkdirSync(wfPath, { recursive: true });

      // Copy template
      const templatePath = path.resolve(__dirname, '../resources/templates/workflow.knime.template');
      if (!fs.existsSync(templatePath)) {
         // Fallback for dev environment
         const devTemplatePath = path.resolve(__dirname, '../../src/resources/templates/workflow.knime.template');
         if (fs.existsSync(devTemplatePath)) {
           copyTemplate(devTemplatePath, wfPath, name);
         } else {
           throw new Error(`Template not found at ${templatePath}`);
         }
      } else {
        copyTemplate(templatePath, wfPath, name);
      }

      console.log(chalk.green(`✅ Workflow ${name} initialisé dans ${wfPath}`));
    } catch (err: any) {
      console.error(chalk.red(`❌ Erreur lors de la création : ${err.message}`));
      process.exit(1);
    }
  });

function copyTemplate(src: string, dest: string, name: string) {
  let content = fs.readFileSync(src, 'utf8');
  content = content.replace('{{NAME}}', name)
                   .replace('{{DATE}}', new Date().toISOString());

  fs.writeFileSync(path.join(dest, 'workflow.knime'), content);
}
