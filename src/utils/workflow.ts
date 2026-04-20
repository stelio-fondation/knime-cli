import * as fs from 'fs';
import * as path from 'path';

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
