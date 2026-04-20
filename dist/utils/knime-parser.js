"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseWorkflowMetadata = parseWorkflowMetadata;
const fast_xml_parser_1 = require("fast-xml-parser");
/**
 * Parse le contenu XML d'un fichier workflow.knime.
 */
function parseWorkflowMetadata(xmlData, fallbackName) {
    const parser = new fast_xml_parser_1.XMLParser({ ignoreAttributes: false });
    const jsonObj = parser.parse(xmlData);
    const entries = jsonObj.config?.entry || [];
    const metadata = {};
    // Normaliser les entrées
    const entryList = Array.isArray(entries) ? entries : [entries];
    entryList.forEach(e => {
        if (e?.['@_key']) {
            metadata[e['@_key']] = e['@_value'];
        }
    });
    const nodes = [];
    const configs = jsonObj.config?.config || [];
    const configList = Array.isArray(configs) ? configs : [configs];
    const nodesConfig = configList.find((c) => c?.['@_key'] === 'nodes');
    if (nodesConfig) {
        const nodeConfigs = nodesConfig.config || [];
        const nodeList = Array.isArray(nodeConfigs) ? nodeConfigs : [nodeConfigs];
        nodeList.forEach((n) => {
            const nodeEntries = Array.isArray(n?.entry) ? n.entry : [n?.entry];
            const id = nodeEntries.find((e) => e?.['@_key'] === 'id')?.['@_value'];
            const settingsFile = nodeEntries.find((e) => e?.['@_key'] === 'node_settings_file')?.['@_value'];
            if (settingsFile) {
                const nodeName = settingsFile.split('/')[0].replace(/\s+\(#\d+\)$/, '');
                nodes.push({ id: id || '?', name: nodeName });
            }
        });
    }
    const connections = [];
    const connectionsConfig = configList.find((c) => c?.['@_key'] === 'connections');
    if (connectionsConfig) {
        const connectionConfigs = connectionsConfig.config || [];
        const connectionList = Array.isArray(connectionConfigs) ? connectionConfigs : [connectionConfigs];
        connectionList.forEach((c) => {
            const connEntries = Array.isArray(c?.entry) ? c.entry : [c?.entry];
            const sourceID = connEntries.find((e) => e?.['@_key'] === 'sourceID')?.['@_value'];
            const destID = connEntries.find((e) => e?.['@_key'] === 'destID')?.['@_value'];
            if (sourceID && destID) {
                connections.push({ sourceID, destID });
            }
        });
    }
    const annotations = [];
    const annotationsConfig = configList.find((c) => c?.['@_key'] === 'annotations');
    if (annotationsConfig) {
        const annotationConfigs = annotationsConfig.config || [];
        const annotationList = Array.isArray(annotationConfigs) ? annotationConfigs : [annotationConfigs];
        annotationList.forEach((a) => {
            const annEntries = Array.isArray(a?.entry) ? a.entry : [a?.entry];
            const text = annEntries.find((e) => e?.['@_key'] === 'text')?.['@_value'];
            if (text) {
                annotations.push(text);
            }
        });
    }
    return {
        name: metadata['name'] || fallbackName,
        author: metadata['author'] || 'Unknown',
        version: metadata['created_by'] || 'Unknown',
        description: metadata['description'] || '',
        nodes,
        connections,
        annotations
    };
}
//# sourceMappingURL=knime-parser.js.map