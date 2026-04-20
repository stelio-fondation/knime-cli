import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';

interface Workflow {
  name: string;
  path: string;
  size: number;
  modified: Date;
}

function isKnimeWorkflow(dirPath: string): boolean {
  try {
    const entries = fs.readdirSync(dirPath);
    return entries.includes('workflow.knime');
  } catch {
    return false;
  }
}

function getWorkflowSize(dirPath: string): number {
  let totalSize = 0;
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isFile()) {
        totalSize += fs.statSync(fullPath).size;
      } else if (entry.isDirectory()) {
        totalSize += getWorkflowSize(fullPath);
      }
    }
  } catch {
    // ignore
  }
  return totalSize;
}

function scanDirectory(dirPath: string, fullPath: boolean = false): Workflow[] {
  const workflows: Workflow[] = [];

  if (!fs.existsSync(dirPath)) {
    console.error(`Error: Directory not found: ${dirPath}`);
    process.exit(1);
  }

  if (isKnimeWorkflow(dirPath)) {
    const stats = fs.statSync(dirPath);
    workflows.push({
      name: path.basename(dirPath).replace('.knwf', ''),
      path: dirPath,
      size: getWorkflowSize(dirPath),
      modified: stats.mtime,
    });
    return workflows;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullEntryPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      const subWorkflows = scanDirectory(fullEntryPath, fullPath);
      for (const wf of subWorkflows) {
        const wfName = fullPath 
          ? `${entry.name}/${wf.name}` 
          : wf.name;
        workflows.push({
          ...wf,
          name: wfName,
        });
      }
    }
  }

  return workflows.sort((a, b) => a.name.localeCompare(b.name));
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const listCommand = new Command('list')
  .description('Liste les workflows KNIME')
  .option('-p, --path <path>', 'Chemin du dossier contenant les workflows', '.')
  .option('-r, --recursive', 'Affiche le chemin complet des workflows')
  .action(async (options: any) => {
    const workflows = scanDirectory(options.path, options.recursive || false);

    if (workflows.length === 0) {
      console.log('No workflows found.');
      return;
    }

    console.log(`\nFound ${workflows.length} workflow(s):\n`);
    console.log('Name'.padEnd(30) + 'Size'.padEnd(12) + 'Modified');
    console.log('-'.repeat(60));

    for (const wf of workflows) {
      console.log(
        wf.name.padEnd(30) +
        formatSize(wf.size).padEnd(12) +
        wf.modified.toISOString().split('T')[0]
      );
    }
    console.log('');
  });