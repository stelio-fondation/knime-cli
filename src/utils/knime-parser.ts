import { XMLParser } from 'fast-xml-parser';
import * as path from 'path';

export interface WorkflowMetadata {
  name: string;
  author: string;
  version: string;
  description: string;
  nodes: { id: string; name: string }[];
}

interface KnimeEntry {
  '@_key': string;
  '@_value': string;
  '@_type': string;
}

/**
 * Parse le contenu XML d'un fichier workflow.knime.
 */
export function parseWorkflowMetadata(xmlData: string, fallbackName: string): WorkflowMetadata {
  const parser = new XMLParser({ ignoreAttributes: false });
  const jsonObj = parser.parse(xmlData);

  const entries: KnimeEntry[] = jsonObj.config?.entry || [];
  const metadata: Record<string, string> = {};

  // Normaliser les entrées
  const entryList = Array.isArray(entries) ? entries : [entries];
  entryList.forEach(e => {
    if (e?.['@_key']) {
      metadata[e['@_key']] = e['@_value'];
    }
  });

  const nodes: { id: string; name: string }[] = [];
  const configs = jsonObj.config?.config || [];
  const configList = Array.isArray(configs) ? configs : [configs];
  const nodesConfig = configList.find((c: any) => c?.['@_key'] === 'nodes');

  if (nodesConfig) {
    const nodeConfigs = nodesConfig.config || [];
    const nodeList = Array.isArray(nodeConfigs) ? nodeConfigs : [nodeConfigs];
    
    nodeList.forEach((n: any) => {
      const nodeEntries = Array.isArray(n?.entry) ? n.entry : [n?.entry];
      const id = nodeEntries.find((e: any) => e?.['@_key'] === 'id')?.['@_value'];
      const settingsFile = nodeEntries.find((e: any) => e?.['@_key'] === 'node_settings_file')?.['@_value'];
      
      if (settingsFile) {
        const nodeName = settingsFile.split('/')[0].replace(/\s+\(#\d+\)$/, '');
        nodes.push({ id: id || '?', name: nodeName });
      }
    });
  }

  return {
    name: metadata['name'] || fallbackName,
    author: metadata['author'] || 'Unknown',
    version: metadata['created_by'] || 'Unknown',
    description: metadata['description'] || '',
    nodes
  };
}
