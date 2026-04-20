import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { XMLParser } from 'fast-xml-parser';
import { resolveWorkflowPath } from '../utils/workflow';

interface InfoOptions {
  workflow: string;
  path?: string;
}

interface KnimeEntry {
  '@_key': string;
  '@_value': string;
  '@_type': string;
}

function getWorkflowInfo(targetPath: string, isDir: boolean) {
  if (!fs.existsSync(targetPath)) {
    console.error(`Error: Workflow not found: ${targetPath}`);
    process.exit(1);
  }

  const stats = fs.statSync(targetPath);
  const ext = path.extname(targetPath).toLowerCase();

  console.log('\n=== Workflow System Info ===');
  console.log(`Path:      ${targetPath}`);
  console.log(`Size:      ${(stats.size / 1024).toFixed(2)} KB`);
  console.log(`Modified:  ${stats.mtime.toLocaleString()}`);

  if (isDir) {
    const knimeFile = path.join(targetPath, 'workflow.knime');
    if (fs.existsSync(knimeFile)) {
      try {
        const xmlData = fs.readFileSync(knimeFile, 'utf8');
        const parser = new XMLParser({ ignoreAttributes: false });
        const jsonObj = parser.parse(xmlData);

        const entries: KnimeEntry[] = jsonObj.config?.entry || [];
        const metadata: Record<string, string> = {};

        // Normaliser les entrées si c'est un tableau ou un objet unique
        const entryList = Array.isArray(entries) ? entries : [entries];

        entryList.forEach(e => {
          if (e['@_key']) {
            metadata[e['@_key']] = e['@_value'];
          }
        });

        console.log('\n=== KNIME Metadata ===');
        console.log(`Name:      ${metadata['name'] || path.basename(targetPath)}`);
        console.log(`Author:    ${metadata['author'] || 'Unknown'}`);
        console.log(`Version:   ${metadata['created_by'] || 'Unknown'}`);
        if (metadata['description']) {
          console.log(`Description: ${metadata['description']}`);
        }
      } catch (err) {
        console.warn('\n[Warning] Could not parse KNIME metadata file.');
      }
    }
  } else {
    console.log('\n[Note] Extended metadata extraction for .knwf files (ZIP) not implemented yet.');
  }
  console.log('');
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
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });