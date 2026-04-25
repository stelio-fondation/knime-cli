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
    const variables = [];
    const variablesConfig = configList.find((c) => c?.['@_key'] === 'workflow_variables');
    if (variablesConfig) {
        const varConfigs = variablesConfig.config || [];
        const varList = Array.isArray(varConfigs) ? varConfigs : [varConfigs];
        varList.forEach((v) => {
            const varEntries = Array.isArray(v?.entry) ? v.entry : [v?.entry];
            const name = varEntries.find((e) => e?.['@_key'] === 'name')?.['@_value'];
            const type = varEntries.find((e) => e?.['@_key'] === 'class')?.['@_value'];
            const value = varEntries.find((e) => e?.['@_key'] === 'value')?.['@_value'];
            if (name) {
                variables.push({
                    name,
                    type: type?.replace('java.lang.', '') || 'String',
                    value: value || ''
                });
            }
        });
    }
    const bundles = [];
    const metaInfoConfig = configList.find((c) => c?.['@_key'] === 'meta_information');
    if (metaInfoConfig) {
        const metaEntries = Array.isArray(metaInfoConfig.entry) ? metaInfoConfig.entry : [metaInfoConfig.entry];
        const bName = metaEntries.find((e) => e?.['@_key'] === 'bundle_name')?.['@_value'];
        const bVer = metaEntries.find((e) => e?.['@_key'] === 'bundle_version')?.['@_value'];
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
//# sourceMappingURL=knime-parser.js.map