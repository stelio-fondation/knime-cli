export interface JobStatus {
    id: string;
    status: 'IDLE' | 'EXECUTING' | 'FINISHED' | 'FAILED' | 'DISCARDED';
    message?: string;
}
export declare class KnimeServerClient {
    private client;
    constructor();
    /**
     * Lance l'exécution d'un workflow sur le serveur.
     * @param workflowPath Chemin relatif sur le serveur
     * @param parameters Paramètres d'entrée
     * @returns ID du job créé
     */
    executeWorkflow(workflowPath: string, parameters?: Record<string, string>): Promise<string>;
    /**
     * Récupère le statut d'un job.
     */
    getJobStatus(jobId: string): Promise<JobStatus>;
    /**
     * Supprime/Arrête un job.
     */
    deleteJob(jobId: string): Promise<void>;
}
//# sourceMappingURL=server-api.d.ts.map