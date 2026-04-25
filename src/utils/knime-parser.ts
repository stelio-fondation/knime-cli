import { XMLParser } from 'fast-xml-parser';
import * as path from 'path';

export interface WorkflowMetadata {
  name: string;
  author: string;
  version: string;
  description: string;
  nodes: { id: string; name: string }[];
  connections: { sourceID: string; destID: string }[];
  annotations: string[];
  variables: { name: string; type: string; value: string }[];
  bundles: { name: string; version: string }[];
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

  const connections: { sourceID: string; destID: string }[] = [];
  const connectionsConfig = configList.find((c: any) => c?.['@_key'] === 'connections');

  if (connectionsConfig) {
    const connectionConfigs = connectionsConfig.config || [];
    const connectionList = Array.isArray(connectionConfigs) ? connectionConfigs : [connectionConfigs];

    connectionList.forEach((c: any) => {
      const connEntries = Array.isArray(c?.entry) ? c.entry : [c?.entry];
      const sourceID = connEntries.find((e: any) => e?.['@_key'] === 'sourceID')?.['@_value'];
      const destID = connEntries.find((e: any) => e?.['@_key'] === 'destID')?.['@_value'];
      if (sourceID && destID) {
        connections.push({ sourceID, destID });
      }
    });
  }

  const annotations: string[] = [];
  const annotationsConfig = configList.find((c: any) => c?.['@_key'] === 'annotations');

  if (annotationsConfig) {
    const annotationConfigs = annotationsConfig.config || [];
    const annotationList = Array.isArray(annotationConfigs) ? annotationConfigs : [annotationConfigs];

    annotationList.forEach((a: any) => {
      const annEntries = Array.isArray(a?.entry) ? a.entry : [a?.entry];
      const text = annEntries.find((e: any) => e?.['@_key'] === 'text')?.['@_value'];
      if (text) {
        annotations.push(text);
      }
    });
  }

  const variables: { name: string; type: string; value: string }[] = [];
  const variablesConfig = configList.find((c: any) => c?.['@_key'] === 'workflow_variables');

  if (variablesConfig) {
    const varConfigs = variablesConfig.config || [];
    const varList = Array.isArray(varConfigs) ? varConfigs : [varConfigs];

    varList.forEach((v: any) => {
      const varEntries = Array.isArray(v?.entry) ? v.entry : [v?.entry];
      const name = varEntries.find((e: any) => e?.['@_key'] === 'name')?.['@_value'];
      const type = varEntries.find((e: any) => e?.['@_key'] === 'class')?.['@_value'];
      const value = varEntries.find((e: any) => e?.['@_key'] === 'value')?.['@_value'];
      if (name) {
        variables.push({ 
          name, 
          type: type?.replace('java.lang.', '') || 'String', 
          value: value || '' 
        });
      }
    });
  }

  const bundles: { name: string; version: string }[] = [];
  const metaInfoConfig = configList.find((c: any) => c?.['@_key'] === 'meta_information');
  if (metaInfoConfig) {
    const metaEntries = Array.isArray(metaInfoConfig.entry) ? metaInfoConfig.entry : [metaInfoConfig.entry];
    const bName = metaEntries.find((e: any) => e?.['@_key'] === 'bundle_name')?.['@_value'];
    const bVer = metaEntries.find((e: any) => e?.['@_key'] === 'bundle_version')?.['@_value'];
    if (bName) {
      bundles.push({ name: bName, version: bVer || 'Unknown' });
    }
  }

  return {
    name: metadata['name'] || fallbackName,
    author: metadata['author'] || 'Unknown',
    version: metadata['created_by'] || 'Unknown',
    description: metadata['description'] || '',
    nodes,
    connections,
    annotations,
    variables,
    bundles
  };
}
