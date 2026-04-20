"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnimeServerClient = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("./config"));
class KnimeServerClient {
    constructor() {
        const url = config_1.default.get('server.url');
        const username = config_1.default.get('server.username');
        const password = config_1.default.get('server.password');
        if (!url) {
            throw new Error('Server URL not configured. Use: knime config set server.url <url>');
        }
        this.client = axios_1.default.create({
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
    async executeWorkflow(workflowPath, parameters = {}) {
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
    async getJobStatus(jobId) {
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
    async deleteJob(jobId) {
        await this.client.delete(`knime/rest/v4/jobs/${jobId}`);
    }
}
exports.KnimeServerClient = KnimeServerClient;
//# sourceMappingURL=server-api.js.map