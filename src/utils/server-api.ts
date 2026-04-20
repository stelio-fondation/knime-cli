import axios, { AxiosInstance } from 'axios';
import config from './config';

export interface JobStatus {
  id: string;
  status: 'IDLE' | 'EXECUTING' | 'FINISHED' | 'FAILED' | 'DISCARDED';
  message?: string;
}

export class KnimeServerClient {
  private client: AxiosInstance;

  constructor() {
    const url = config.get('server.url') as string;
    const username = config.get('server.username') as string;
    const password = config.get('server.password') as string;

    if (!url) {
      throw new Error('Server URL not configured. Use: knime config set server.url <url>');
    }

    this.client = axios.create({
      baseURL: url.endsWith('/') ? url : `${url}/`,
      auth: username ? { username, password: password || '' } : undefined,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Lance l'exécution d'un workflow sur le serveur.
   * @param workflowPath Chemin relatif sur le serveur
   * @param parameters Paramètres d'entrée
   * @returns ID du job créé
   */
  async executeWorkflow(workflowPath: string, parameters: Record<string, string> = {}): Promise<string> {
    const normalizedPath = workflowPath.startsWith('/') ? workflowPath.substring(1) : workflowPath;
    
    // Formatage des paramètres pour l'API KNIME Server
    const body = {
      parameters: Object.entries(parameters).map(([name, value]) => ({
        name,
        value,
        type: 'String'
      }))
    };

    const response = await this.client.post(`knime/rest/v4/repository/${normalizedPath}:execution`, body);
    return response.data.jobId || response.data.id;
  }

  /**
   * Récupère le statut d'un job.
   */
  async getJobStatus(jobId: string): Promise<JobStatus> {
    const response = await this.client.get(`knime/rest/v4/jobs/${jobId}`);
    const data = response.data;
    return {
      id: jobId,
      status: data.status,
      message: data.message
    };
  }

  /**
   * Supprime/Arrête un job.
   */
  async deleteJob(jobId: string): Promise<void> {
    await this.client.delete(`knime/rest/v4/jobs/${jobId}`);
  }
}
