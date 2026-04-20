import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';

interface InfoOptions {
  workflow: string;
  path?: string;
}

function getWorkflowInfo(workflowPath: string) {
  if (!fs.existsSync(workflowPath)) {
    console.error(`Error: Workflow not found: ${workflowPath}`);
    process.exit(1);
  }

  const stats = fs.statSync(workflowPath);
  const ext = path.extname(workflowPath).toLowerCase();

  console.log('\n=== Workflow Info ===\n');
  console.log(`Name:    ${path.basename(workflowPath, ext)}`);
  console.log(`Path:    ${workflowPath}`);
  console.log(`Size:    ${(stats.size / 1024).toFixed(2)} KB`);
  console.log(`Created: ${stats.birthtime.toISOString()}`);
  console.log(`Modified:${stats.mtime.toISOString()}`);
  console.log('');
}

export const infoCommand = new Command('info')
  .description('Affiche les details dun workflow')
  .requiredOption('-w, --workflow <name>', 'Nom du workflow')
  .option('-p, --path <path>', 'Chemin du dossier contenant le workflow', '.')
  .action(async (options: InfoOptions) => {
    const workflowFile = options.path 
      ? path.join(options.path, options.workflow.endsWith('.knwf') ? options.workflow : `${options.workflow}.knwf`)
      : options.workflow.endsWith('.knwf') 
        ? options.workflow 
        : `${options.workflow}.knwf`;

    getWorkflowInfo(workflowFile);
  });