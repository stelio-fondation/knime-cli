"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addNodeCommand = void 0;
const commander_1 = require("commander");
const fast_xml_parser_1 = require("fast-xml-parser");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const parser = new fast_xml_parser_1.XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    parseAttributeValue: true
});
const builder = new fast_xml_parser_1.XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    format: true,
    indentBy: "    "
});
const FACTORY_MAP = {
    'CSV Reader': 'org.knime.base.node.io.filehandling.csv.reader.CSVTableReaderNodeFactory',
    'Excel Reader': 'org.knime.ext.poi3.node.io.excel.reader.ExcelReaderNodeFactory3',
    'CSV Writer': 'org.knime.base.node.io.filehandling.csv.writer.CSVTableWriterNodeFactory',
    'Excel Writer': 'org.knime.ext.poi3.node.io.excel.writer.ExcelWriterNodeFactory3',
    'GroupBy': 'org.knime.base.node.preproc.groupby.GroupByNodeFactory',
    'Joiner': 'org.knime.base.node.preproc.joiner3.Joiner3NodeFactory',
    'Row Filter': 'org.knime.base.node.preproc.filter.row.RowFilterNodeFactory',
    'Column Filter': 'org.knime.base.node.preproc.filter.column.DataColumnSpecFilterNodeFactory',
    'Table Creator': 'org.knime.base.node.io.tablecreator.TableCreator2NodeFactory'
};
exports.addNodeCommand = new commander_1.Command('add-node')
    .description('Ajoute un nœud à un workflow')
    .requiredOption('-w, --workflow <name>', 'Nom du workflow')
    .requiredOption('-t, --type <type>', 'Type de nœud (ex: "CSV Reader")')
    .option('-i, --id <id>', 'ID du nœud (numérique)')
    .option('-p, --path <path>', 'Répertoire des workflows', '.')
    .action((options) => {
    try {
        const wfPath = path.join(options.path, options.workflow);
        const workflowFile = path.join(wfPath, 'workflow.knime');
        if (!fs.existsSync(workflowFile)) {
            console.error(chalk_1.default.red(`❌ Workflow ${options.workflow} non trouvé dans ${options.path}`));
            process.exit(1);
        }
        const nodeId = parseInt(options.id) || findNextNodeId(wfPath);
        const nodeName = `${options.type} (#${nodeId})`;
        const nodeDir = path.join(wfPath, nodeName);
        // 1. Create node directory
        if (!fs.existsSync(nodeDir)) {
            fs.mkdirSync(nodeDir, { recursive: true });
        }
        // 2. Create settings.xml for node
        const templatePath = path.resolve(__dirname, '../resources/templates/nodes/generic/settings.xml');
        const devTemplatePath = path.resolve(__dirname, '../../src/resources/templates/nodes/generic/settings.xml');
        const actualTemplatePath = fs.existsSync(templatePath) ? templatePath : devTemplatePath;
        if (!fs.existsSync(actualTemplatePath)) {
            throw new Error(`Template settings.xml non trouvé.`);
        }
        let settingsContent = fs.readFileSync(actualTemplatePath, 'utf8');
        settingsContent = settingsContent.replace('{{NODE_NAME}}', options.type)
            .replace('{{FACTORY}}', FACTORY_MAP[options.type] || options.type);
        fs.writeFileSync(path.join(nodeDir, 'settings.xml'), settingsContent);
        // 3. Update workflow.knime
        const xml = fs.readFileSync(workflowFile, 'utf8');
        const jsonObj = parser.parse(xml);
        if (!jsonObj.config.config)
            jsonObj.config.config = [];
        let nodesConfig = jsonObj.config.config.find((c) => c['@_key'] === 'nodes');
        if (!nodesConfig) {
            nodesConfig = { '@_key': 'nodes', config: [] };
            jsonObj.config.config.push(nodesConfig);
        }
        if (!nodesConfig.config)
            nodesConfig.config = [];
        if (!Array.isArray(nodesConfig.config)) {
            // If it was a single object, convert to array
            nodesConfig.config = [nodesConfig.config];
        }
        nodesConfig.config.push({
            '@_key': `node_${nodeId}`,
            'entry': [
                { '@_key': 'id', '@_type': 'xint', '@_value': nodeId },
                { '@_key': 'node_settings_file', '@_type': 'xstring', '@_value': `${nodeName}/settings.xml` },
                { '@_key': 'node_is_meta', '@_type': 'xboolean', '@_value': false },
                { '@_key': 'node_type', '@_type': 'xstring', '@_value': 'NativeNode' },
                { '@_key': 'ui_classname', '@_type': 'xstring', '@_value': 'org.knime.core.node.workflow.NodeUIInformation' }
            ],
            'config': {
                '@_key': 'ui_settings',
                'config': {
                    '@_key': 'extrainfo.node.bounds',
                    'entry': [
                        { '@_key': 'array-size', '@_type': 'xint', '@_value': 4 },
                        { '@_key': '0', '@_type': 'xint', '@_value': 150 * nodeId },
                        { '@_key': '1', '@_type': 'xint', '@_value': 150 },
                        { '@_key': '2', '@_type': 'xint', '@_value': -1 },
                        { '@_key': '3', '@_type': 'xint', '@_value': -1 }
                    ]
                }
            }
        });
        fs.writeFileSync(workflowFile, builder.build(jsonObj));
        console.log(chalk_1.default.green(`✅ Nœud ${nodeName} ajouté au workflow.`));
    }
    catch (err) {
        console.error(chalk_1.default.red(`❌ Erreur lors de l'ajout du nœud : ${err.message}`));
        process.exit(1);
    }
});
function findNextNodeId(wfPath) {
    const files = fs.readdirSync(wfPath);
    let maxId = 0;
    files.forEach(f => {
        const match = f.match(/\(#(\d+)\)/);
        if (match) {
            const id = parseInt(match[1]);
            if (id > maxId)
                maxId = id;
        }
    });
    return maxId + 1;
}
//# sourceMappingURL=add-node.js.map