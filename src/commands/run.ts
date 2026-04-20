import { Command } from 'commander';
import { KnimeServerClient } from '../utils/server-api';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';
import config from '../utils/config';
import { resolveWorkflowPath } from '../utils/workflow';
import { addExecution, removeExecution } from '../utils/registry';

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
    const possiblePaths = [
      path.join(knimePath, 'knime'),
      path.join(knimePath, 'knime.exe'),
      path.join(knimePath, 'knime.bat'),
    ];
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) return p;
    }
    return null;
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
      const spinner = ora(`Connecting to KNIME Server...`).start();
      try {
        const client = new KnimeServerClient();
        const params = parseParams(options.params || '{}');
        
        spinner.text = `Executing ${chalk.cyan(options.workflow)} on server...`;
        const jobId = await client.executeWorkflow(options.workflow, params);
        
        spinner.text = `Job created: ${chalk.green(jobId)}. Polling status...`;

        let finished = false;
        while (!finished) {
          const status = await client.getJobStatus(jobId);
          
          if (status.status === 'FINISHED') {
            spinner.succeed(chalk.green(`Workflow executed successfully on server (Job: ${jobId}).`));
            finished = true;
          } else if (status.status === 'FAILED' || status.status === 'DISCARDED') {
            spinner.fail(chalk.red(`Workflow ${status.status.toLowerCase()} on server: ${status.message || 'Check logs on server.'}`));
            finished = true;
            process.exit(1);
          } else {
            spinner.text = `Job ${jobId} is ${chalk.yellow(status.status.toLowerCase())}...`;
          }
          
          if (!finished) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      } catch (err: any) {
        let msg = err.message;
        const serverUrl = config.get('server.url');
        if (err.code === 'ENOTFOUND') {
          msg = `Impossible de joindre le KNIME Server à ${serverUrl}. Vérifiez votre configuration (knime config get server.url).`;
        } else if (err.code === 'ECONNREFUSED') {
          msg = `Connexion refusée par le KNIME Server (${serverUrl}). Assurez-vous que le serveur est démarré.`;
        }
        spinner.fail(chalk.red(`Server Error: ${msg}`));
        process.exit(1);
      }
      return;
    }

    let targetPath = '';
    let workflowArg: '-workflowFile' | '-workflowDir' = '-workflowFile';

    try {
      const target = resolveWorkflowPath(options.workflow, options.path);
      targetPath = target.targetPath;
      workflowArg = target.workflowArg;
    } catch (err: any) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }

    const knimeBatch = findKnimeBatch(options.knimePath || config.get('local.knimePath'));
    if (!knimeBatch) {
      console.error(chalk.red('❌ Error: KNIME not found. Configure it with:'));
      console.log(chalk.cyan('   knime config set local.knimePath "/path/to/knime"'));
      process.exit(1);
    }

    const params = parseParams(options.params || '{}');
    const spinner = ora(`Executing workflow: ${chalk.cyan(options.workflow)}...`).start();

    if (options.verbose) {
      spinner.stop();
      console.log(chalk.blue(`\nExecuting: ${targetPath}`));
      console.log(chalk.blue(`KNIME: ${knimeBatch}\n`));
    }

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
      shell: false
    });

    if (proc.pid) {
      addExecution({
        id: proc.pid.toString(),
        pid: proc.pid,
        workflow: options.workflow,
        startTime: new Date().toISOString(),
        status: 'running'
      });
    }

    proc.on('error', (err) => {
      if (proc.pid) removeExecution(proc.pid);
      spinner.fail(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    });

    proc.on('close', (code) => {
      if (proc.pid) removeExecution(proc.pid);
      if (code === 0) {
        spinner.succeed(chalk.green('Workflow executed successfully.'));
      } else {
        spinner.fail(chalk.red(`Workflow failed with code: ${code}`));
        process.exit(code || 1);
      }
    });
  });