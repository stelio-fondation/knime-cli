export interface WorkflowMetadata {
    name: string;
    author: string;
    version: string;
    description: string;
    nodes: {
        id: string;
        name: string;
    }[];
    connections: {
        sourceID: string;
        destID: string;
    }[];
    annotations: string[];
    variables: {
        name: string;
        type: string;
        value: string;
    }[];
    bundles: {
        name: string;
        version: string;
    }[];
}
/**
 * Parse le contenu XML d'un fichier workflow.knime.
 */
export declare function parseWorkflowMetadata(xmlData: string, fallbackName: string): WorkflowMetadata;
//# sourceMappingURL=knime-parser.d.ts.map