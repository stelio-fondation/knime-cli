import * as fs from 'fs';
import * as path from 'path';
import { parseWorkflowMetadata, WorkflowMetadata } from './knime-parser';
import AdmZip = require('adm-zip');

export interface WorkflowTarget {
  targetPath: string;
  workflowArg: '-workflowFile' | '-workflowDir';
}

/**
 * Résout le chemin du workflow et détecte son type (fichier ou dossier).
 */
export function resolveWorkflowPath(workflow: string, basePath?: string): WorkflowTarget {
  const targetPath = path.isAbsolute(workflow)
    ? workflow
    : path.join(basePath || '.', workflow);

  if (!fs.existsSync(targetPath)) {
    throw new Error(`Workflow not found: ${targetPath}`);
  }

  const stats = fs.statSync(targetPath);
  
  if (stats.isFile() && targetPath.endsWith('.knwf')) {
    return { targetPath, workflowArg: '-workflowFile' };
  } else if (stats.isDirectory() && fs.existsSync(path.join(targetPath, 'workflow.knime'))) {
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
    const xmlData = fs.readFileSync(xmlPath, 'utf8');
    return parseWorkflowMetadata(xmlData, path.basename(targetPath));
  }
}
