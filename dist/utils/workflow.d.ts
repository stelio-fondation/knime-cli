import { WorkflowMetadata } from './knime-parser';
export interface WorkflowTarget {
    targetPath: string;
    workflowArg: '-workflowFile' | '-workflowDir';
}
/**
 * Vérifie si un dossier est un workflow KNIME.
 */
export declare function isKnimeWorkflow(dirPath: string): boolean;
/**
 * Recherche récursivement un workflow par son nom dans un dossier de base.
 */
export declare function findWorkflowRecursive(workflowName: string, basePath: string): string | null;
/**
 * Résout le chemin du workflow et détecte son type (fichier ou dossier).
 * Supporte désormais la recherche récursive si non trouvé au premier niveau.
 */
export declare function resolveWorkflowPath(workflow: string, basePath?: string): WorkflowTarget;
/**
 * Récupère les métadonnées d'un workflow (depuis ZIP ou dossier).
 */
export declare function getWorkflowMetadata(workflow: string, basePath?: string): Promise<WorkflowMetadata>;
//# sourceMappingURL=workflow.d.ts.map