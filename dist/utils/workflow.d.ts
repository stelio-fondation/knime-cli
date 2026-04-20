import { WorkflowMetadata } from './knime-parser';
export interface WorkflowTarget {
    targetPath: string;
    workflowArg: '-workflowFile' | '-workflowDir';
}
/**
 * Résout le chemin du workflow et détecte son type (fichier ou dossier).
 */
export declare function resolveWorkflowPath(workflow: string, basePath?: string): WorkflowTarget;
/**
 * Récupère les métadonnées d'un workflow (depuis ZIP ou dossier).
 */
export declare function getWorkflowMetadata(workflow: string, basePath?: string): Promise<WorkflowMetadata>;
//# sourceMappingURL=workflow.d.ts.map