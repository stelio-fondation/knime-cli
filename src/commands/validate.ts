import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { resolveWorkflowPath } from '../utils/workflow';
import { parseWorkflowMetadata } from '../utils/knime-parser';
import { getAllFiles } from '../utils/fs';

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

    try {
      // 1. Résolution du chemin
      console.log(`\nValidating workflow: ${options.workflow}...`);
      const target = resolveWorkflowPath(options.workflow, options.path);
      const isDir = target.workflowArg === '-workflowDir';

      // 2. Lecture des métadonnées
      let xmlData = '';
      if (isDir) {
        xmlData = fs.readFileSync(path.join(target.targetPath, 'workflow.knime'), 'utf8');
      } else {
        // ZIP support could be added here, but metadata parser needs the full XML string
        // We'll use the same logic as info command (centralized parser)
        // For now, let's assume we read from the same logic
        const AdmZip = require('adm-zip');
        const zip = new AdmZip(target.targetPath);
        const knimeEntry = zip.getEntries().find((e: any) => e.entryName.endsWith('workflow.knime'));
        if (knimeEntry) xmlData = zip.readAsText(knimeEntry);
      }

      const metadata = parseWorkflowMetadata(xmlData, options.workflow);
      console.log('✅ Structure base: OK');

      // 3. Vérification des nœuds (Mode dossier seulement)
      if (isDir) {
        let missingNodes = 0;
        metadata.nodes.forEach(node => {
          // KNIME stores node dirs as "Node Name (#ID)"
          // But settingsFile in XML is "Node Name (#ID)/settings.xml"
          // We need to check if the directory exists
          const nodeDir = path.join(target.targetPath, `${node.name} (#${node.id})`);
          if (!fs.existsSync(nodeDir)) {
            console.error(`❌ Missing node directory: ${node.name} (#${node.id})`);
            missingNodes++;
          } else if (!fs.existsSync(path.join(nodeDir, 'settings.xml'))) {
            console.error(`❌ Missing settings.xml in node: ${node.name} (#${node.id})`);
            missingNodes++;
          }
        });

        if (missingNodes === 0) {
          console.log(`✅ Node consistency: OK (${metadata.nodes.length}/${metadata.nodes.length})`);
        } else {
          isValid = false;
        }

        // 4. Scan des fichiers volumineux
        console.log('\nScanning for large files...');
        const allFiles = getAllFiles(target.targetPath);
        const largeFiles = allFiles.filter(f => f.size > thresholdBytes);

        if (largeFiles.length > 0) {
          console.warn(`⚠️  Found ${largeFiles.length} large file(s) (> ${options.threshold} MB):`);
          largeFiles.forEach(f => {
            const relPath = path.relative(target.targetPath, f.path);
            console.warn(`   - ${relPath} (${(f.size / 1024 / 1024).toFixed(2)} MB)`);
          });
          hasWarnings = true;
        } else {
          console.log('✅ No large files detected.');
        }
      }

      // Rapport Final
      console.log('\n-----------------------------------');
      if (!isValid) {
        console.log('Final Status: INVALID ❌');
        process.exit(1);
      } else if (hasWarnings) {
        console.log('Final Status: VALID (with warnings) ⚠️');
      } else {
        console.log('Final Status: VALID ✅');
      }

    } catch (err: any) {
      console.error(`\n❌ Validation failed: ${err.message}`);
      process.exit(1);
    }
  });