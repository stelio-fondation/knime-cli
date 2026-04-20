import * as fs from 'fs';
import * as path from 'path';
import { parseWorkflowMetadata, WorkflowMetadata } from './knime-parser';
import AdmZip = require('adm-zip');

export interface WorkflowTarget {
  targetPath: string;
  workflowArg: '-workflowFile' | '-workflowDir';
}

/**
 * Vérifie si un dossier est un workflow KNIME.
 */
export function isKnimeWorkflow(dirPath: string): boolean {
  try {
    return fs.existsSync(path.join(dirPath, 'workflow.knime'));
  } catch {
    return false;
  }
}

/**
 * Recherche récursivement un workflow par son nom dans un dossier de base.
 */
export function findWorkflowRecursive(workflowName: string, basePath: string): string | null {
  if (!fs.existsSync(basePath)) return null;

  // Si c'est déjà le dossier du workflow
  if (isKnimeWorkflow(basePath) && path.basename(basePath) === workflowName) {
    return basePath;
  }

  const entries = fs.readdirSync(basePath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(basePath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === workflowName && isKnimeWorkflow(fullPath)) {
        return fullPath;
      }
      const found = findWorkflowRecursive(workflowName, fullPath);
      if (found) return found;
    } else if (entry.isFile() && entry.name === `${workflowName}.knwf`) {
      return fullPath;
    }
  }
  return null;
}

/**
 * Résout le chemin du workflow et détecte son type (fichier ou dossier).
 * Supporte désormais la recherche récursive si non trouvé au premier niveau.
 */
export function resolveWorkflowPath(workflow: string, basePath?: string): WorkflowTarget {
  const root = basePath || '.';
  
  // 1. Essai direct
  let targetPath = path.isAbsolute(workflow)
    ? workflow
    : path.join(root, workflow);

  // 2. Si non trouvé, recherche récursive par nom
  if (!fs.existsSync(targetPath)) {
    const found = findWorkflowRecursive(workflow, root);
    if (found) {
      targetPath = found;
    } else {
      throw new Error(`Workflow not found: ${workflow}. Tried direct path and recursive search in ${path.resolve(root)}`);
    }
  }

  const stats = fs.statSync(targetPath);
  
  if (stats.isFile() && targetPath.endsWith('.knwf')) {
    return { targetPath, workflowArg: '-workflowFile' };
  } else if (stats.isDirectory() && isKnimeWorkflow(targetPath)) {
    return { targetPath, workflowArg: '-workflowDir' };
  } else {
    throw new Error(`Path is not a valid KNIME workflow: ${targetPath}. Must be a .knwf file or a directory containing workflow.knime`);
  }
}

/**
 * Récupère les métadonnées d'un workflow (depuis ZIP ou dossier).
 */
export async function getWorkflowMetadata(workflow: string, basePath?: string): Promise<WorkflowMetadata> {
  const { targetPath, workflowArg } = resolveWorkflowPath(workflow, basePath);
  
  if (workflowArg === '-workflowFile') {
    const zip = new AdmZip(targetPath);
    const workflowKnime = zip.getEntries().find(e => e.entryName.endsWith('workflow.knime'));
    if (!workflowKnime) throw new Error('Could not find workflow.knime in ZIP');
    return parseWorkflowMetadata(workflowKnime.getData().toString('utf8'), path.basename(targetPath));
  } else {
    const xmlPath = path.join(targetPath, 'workflow.knime');
    const xmlData = fs.readFileSync(xmlPath, { encoding: 'utf8' });
    return parseWorkflowMetadata(xmlData, path.basename(targetPath));
  }
}
