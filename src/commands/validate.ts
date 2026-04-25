import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { resolveWorkflowPath } from '../utils/workflow';
import { parseWorkflowMetadata } from '../utils/knime-parser';
import { getAllFiles } from '../utils/fs';
import AdmZip from 'adm-zip';

interface ValidateOptions {
  workflow: string;
  path?: string;
  threshold: string;
}

export const validateCommand = new Command('validate')
  .description('Valide la structure d\'un workflow KNIME et détecte les fichiers volumineux')
  .requiredOption('-w, --workflow <name>', 'Nom du workflow')
  .option('-p, --path <path>', 'Chemin du dossier de recherche', '.')
  .option('--threshold <mb>', 'Seuil d\'alerte pour les fichiers volumineux (Mo)', '10')
  .action(async (options: ValidateOptions) => {
    const thresholdBytes = parseFloat(options.threshold) * 1024 * 1024;
    let isValid = true;
    let hasWarnings = false;

    const spinner = ora(`Validating workflow: ${chalk.cyan(options.workflow)}...`).start();

    try {
      // 1. Résolution du chemin
      const target = resolveWorkflowPath(options.workflow, options.path);
      const isDir = target.workflowArg === '-workflowDir';

      // 2. Lecture des métadonnées
      let xmlData = '';
      if (isDir) {
        xmlData = fs.readFileSync(path.join(target.targetPath, 'workflow.knime'), 'utf8');
      } else {
        const zip = new AdmZip(target.targetPath);
        const knimeEntry = zip.getEntries().find((e: any) => e.entryName.endsWith('workflow.knime'));
        if (knimeEntry) xmlData = zip.readAsText(knimeEntry);
      }

      if (!xmlData) {
        throw new Error('Workflow metadata file (workflow.knime) not found.');
      }

      const metadata = parseWorkflowMetadata(xmlData, options.workflow);
      spinner.info(chalk.green('Structure base: OK'));

      // 3. Vérification des nœuds (Mode dossier seulement)
      if (isDir) {
        let missingNodes = 0;
        metadata.nodes.forEach(node => {
          const nodeDir = path.join(target.targetPath, `${node.name} (#${node.id})`);
          if (!fs.existsSync(nodeDir)) {
            console.error(chalk.red(`   ❌ Missing node directory: ${node.name} (#${node.id})`));
            missingNodes++;
          } else if (!fs.existsSync(path.join(nodeDir, 'settings.xml'))) {
            console.error(chalk.red(`   ❌ Missing settings.xml in node: ${node.name} (#${node.id})`));
            missingNodes++;
          }
        });

        if (missingNodes === 0) {
          spinner.info(chalk.green(`Node consistency: OK (${metadata.nodes.length}/${metadata.nodes.length})`));
        } else {
          isValid = false;
          spinner.warn(chalk.red(`Node consistency: FAILED (${missingNodes} missing)`));
        }

        // 4. Scan des fichiers volumineux
        spinner.start('Scanning for large files...');
        const allFiles = getAllFiles(target.targetPath);
        const largeFiles = allFiles.filter(f => f.size > thresholdBytes);

        if (largeFiles.length > 0) {
          spinner.warn(chalk.yellow(`Found ${largeFiles.length} large file(s) (> ${options.threshold} MB):`));
          largeFiles.forEach(f => {
            const relPath = path.relative(target.targetPath, f.path);
            console.warn(chalk.gray(`   - ${relPath} (${chalk.yellow((f.size / 1024 / 1024).toFixed(2))} MB)`));
          });
          hasWarnings = true;
        } else {
          spinner.succeed(chalk.green('No large files detected.'));
        }
      } else {
        spinner.info(chalk.gray('Large file scan skipped (archive mode)'));
      }

      // Rapport Final
      console.log(chalk.gray('\n-----------------------------------'));
      console.log(`${chalk.blue('ℹ')} Nodes: ${metadata.nodes.length} | Connections: ${metadata.connections.length} | Variables: ${metadata.variables.length}`);
      
      if (metadata.bundles.length > 0) {
        console.log(`\n${chalk.bold.blue('=== Requirements ===')}`);
        metadata.bundles.forEach(b => {
          console.log(`  - ${b.name} (${b.version})`);
        });
      }
      if (!isValid) {
        console.log(`${chalk.bold('Final Status:')} ${chalk.bold.red('INVALID ❌')}`);
        process.exit(1);
      } else if (hasWarnings) {
        console.log(`${chalk.bold('Final Status:')} ${chalk.bold.yellow('VALID (with warnings) ⚠️')}`);
      } else {
        console.log(`${chalk.bold('Final Status:')} ${chalk.bold.green('VALID ✅')}`);
      }

    } catch (err: any) {
      spinner.fail(chalk.red(`Validation failed: ${err.message}`));
      process.exit(1);
    }
  });