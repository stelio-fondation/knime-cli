import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import AdmZip from 'adm-zip';
import chalk from 'chalk';
import { resolveWorkflowPath } from '../utils/workflow';
import { parseWorkflowMetadata, WorkflowMetadata } from '../utils/knime-parser';

interface InfoOptions {
  workflow: string;
  path?: string;
}

function displayInfo(metadata: WorkflowMetadata, systemInfo: { path: string, size: number, mtime: Date }) {
  console.log(chalk.bold.blue('\n=== Workflow System Info ==='));
  console.log(`${chalk.gray('Path:')}      ${chalk.cyan(systemInfo.path)}`);
  console.log(`${chalk.gray('Size:')}      ${chalk.yellow((systemInfo.size / 1024).toFixed(2))} KB`);
  console.log(`${chalk.gray('Modified:')}  ${chalk.magenta(systemInfo.mtime.toLocaleString())}`);

  console.log(chalk.bold.green('\n=== KNIME Metadata ==='));
  console.log(`${chalk.gray('Name:')}      ${chalk.bold(metadata.name)}`);
  console.log(`${chalk.gray('Author:')}    ${chalk.white(metadata.author)}`);
  console.log(`${chalk.gray('Version:')}   ${chalk.white(metadata.version)}`);
  if (metadata.description) {
    console.log(`${chalk.gray('Description:')} ${chalk.italic(metadata.description)}`);
  }

  if (metadata.nodes.length > 0) {
    console.log(chalk.bold.cyan(`\n=== Nodes (Total: ${metadata.nodes.length}) ===`));
    metadata.nodes.forEach(n => {
      console.log(`${chalk.gray('[')}${chalk.yellow(n.id)}${chalk.gray(']')} ${n.name}`);
    });
  } else {
    console.log(chalk.bold.cyan('\n=== Nodes ==='));
    console.log(chalk.yellow('No nodes found or empty workflow.'));
  }
  console.log('');
}

function getWorkflowInfo(targetPath: string, isDir: boolean) {
  const stats = fs.statSync(targetPath);
  const fallbackName = path.basename(targetPath, path.extname(targetPath));
  let xmlData = '';

  if (isDir) {
    const knimeFile = path.join(targetPath, 'workflow.knime');
    if (fs.existsSync(knimeFile)) {
      xmlData = fs.readFileSync(knimeFile, 'utf8');
    }
  } else {
    try {
      const zip = new AdmZip(targetPath);
      const zipEntries = zip.getEntries();
      // Chercher workflow.knime (peut être préfixé par le nom du workflow dans le ZIP)
      const knimeEntry = zipEntries.find(e => e.entryName.endsWith('workflow.knime'));
      
      if (knimeEntry) {
        xmlData = zip.readAsText(knimeEntry);
      }
    } catch (err) {
      console.warn(chalk.yellow('\n[Warning] Could not read .knwf archive.'));
    }
  }

  if (xmlData) {
    try {
      const metadata = parseWorkflowMetadata(xmlData, fallbackName);
      displayInfo(metadata, { path: targetPath, size: stats.size, mtime: stats.mtime });
    } catch (err) {
      console.error(chalk.red('\nError: Failed to parse KNIME metadata.'));
    }
  } else {
    console.log(chalk.bold.blue('\n=== Workflow System Info ==='));
    console.log(`${chalk.gray('Path:')}      ${chalk.cyan(targetPath)}`);
    console.log(`${chalk.gray('Size:')}      ${chalk.yellow((stats.size / 1024).toFixed(2))} KB`);
    console.log(`${chalk.gray('Modified:')}  ${chalk.magenta(stats.mtime.toLocaleString())}`);
    console.log(chalk.yellow('\n[Warning] No KNIME metadata found.'));
  }
}

export const infoCommand = new Command('info')
  .description('Affiche les détails d\'un workflow KNIME')
  .requiredOption('-w, --workflow <name>', 'Nom du workflow')
  .option('-p, --path <path>', 'Chemin du dossier contenant le workflow', '.')
  .action(async (options: InfoOptions) => {
    try {
      const target = resolveWorkflowPath(options.workflow, options.path);
      getWorkflowInfo(target.targetPath, target.workflowArg === '-workflowDir');
    } catch (err: any) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }
  });