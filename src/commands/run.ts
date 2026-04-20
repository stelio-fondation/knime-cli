import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { resolveWorkflowPath } from '../utils/workflow';

interface RunOptions {
  workflow: string;
  path?: string;
  server?: boolean;
  params?: string;
  knimePath?: string;
  verbose?: boolean;
  save?: boolean;
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
  .option('--save', 'Sauvegarder le workflow après exécution')
  .action(async (options: RunOptions) => {
    if (options.server) {
      console.log('Server execution not implemented yet');
      return;
    }

    let targetPath = '';
    let workflowArg: '-workflowFile' | '-workflowDir' = '-workflowFile';

    try {
      const target = resolveWorkflowPath(options.workflow, options.path);
      targetPath = target.targetPath;
      workflowArg = target.workflowArg;
    } catch (err: any) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }

    const knimeBatch = findKnimeBatch(options.knimePath || undefined);
    if (!knimeBatch) {
      console.error('Error: KNIME not found. Use --knime-path to specify location.');
      console.log('Download: https://www.knime.com/downloads');
      process.exit(1);
    }

    const params = parseParams(options.params || '{}');

    console.log(`Executing workflow: ${targetPath}`);
    console.log(`KNIME: ${knimeBatch}\n`);

    const args = [
      '-nosplash',
      '-application', 'org.knime.product.KNIME_BATCH_APPLICATION',
      '-reset',
      workflowArg, targetPath
    ];
    
    if (!options.save) {
      args.push('-nosave');
    }
    
    for (const [key, value] of Object.entries(params)) {
      args.push(`-workflow.variable=${key},${value},String`);
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