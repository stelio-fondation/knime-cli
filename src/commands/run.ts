import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';

interface RunOptions {
  workflow: string;
  path?: string;
  server?: boolean;
  params?: string;
  knimePath?: string;
  verbose?: boolean;
}

function findKnimeBatch(knimePath?: string): string | null {
  if (knimePath) {
    const batchPath = path.join(knimePath, 'knime');
    return fs.existsSync(batchPath) ? batchPath : null;
  }

  const possiblePaths = [
    'C:\\Program Files\\KNIME\\knime.exe',
    'C:\\Program Files (x86)\\KNIME\\knime.exe',
    '/usr/local/knime/knime',
    '/opt/knime/knime',
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  return null;
}

function parseParams(paramsStr: string): Record<string, string> {
  try {
    return JSON.parse(paramsStr);
  } catch {
    console.error('Invalid JSON parameters');
    process.exit(1);
  }
}

export const runCommand = new Command('run')
  .description('Exécute un workflow KNIME')
  .requiredOption('-w, --workflow <name>', 'Nom du workflow')
  .option('-p, --path <path>', 'Chemin du dossier contenant le workflow', '.')
  .option('-s, --server', 'Exécuter sur le KNIME Server')
  .option('--params <json>', 'Paramètres au format JSON', '{}')
  .option('-k, --knime-path <path>', 'Chemin vers KNIME')
  .option('-v, --verbose', 'Afficher la sortie KNIME')
  .action(async (options: RunOptions) => {
    if (options.server) {
      console.log('Server execution not implemented yet');
      return;
    }

    const workflowFile = options.path 
      ? path.join(options.path, options.workflow.endsWith('.knwf') ? options.workflow : `${options.workflow}.knwf`)
      : options.workflow.endsWith('.knwf') 
        ? options.workflow 
        : `${options.workflow}.knwf`;

    if (!fs.existsSync(workflowFile)) {
      console.error(`Error: Workflow not found: ${workflowFile}`);
      process.exit(1);
    }

    const knimeBatch = findKnimeBatch(options.knimePath || undefined);
    if (!knimeBatch) {
      console.error('Error: KNIME not found. Use --knime-path to specify location.');
      console.log('Download: https://www.knime.com/downloads');
      process.exit(1);
    }

    const params = parseParams(options.params || '{}');

    console.log(`Executing workflow: ${options.workflow}`);
    console.log(`KNIME: ${knimeBatch}\n`);

    const args = ['-workflowFile', workflowFile];
    
    for (const [key, value] of Object.entries(params)) {
      args.push('-key', key, '-value', value);
    }

    if (!options.verbose) {
      args.push('-consoleLog', 'none');
    }

    const proc = spawn(knimeBatch, args, { 
      stdio: options.verbose ? 'inherit' : 'ignore',
      shell: true 
    });

    proc.on('error', (err) => {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    });

    proc.on('close', (code) => {
      if (code === 0) {
        console.log('\nWorkflow executed successfully.');
      } else {
        console.error(`\nWorkflow failed with code: ${code}`);
        process.exit(code || 1);
      }
    });
  });