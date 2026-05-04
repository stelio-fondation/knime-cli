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
exports.connectCommand = void 0;
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
exports.connectCommand = new commander_1.Command('connect')
    .description('Connecte deux nœuds dans un workflow')
    .requiredOption('-w, --workflow <name>', 'Nom du workflow')
    .requiredOption('--from <nodeId:port>', 'Nœud source et port (ex: 1:1)')
    .requiredOption('--to <nodeId:port>', 'Nœud destination et port (ex: 2:1)')
    .option('-p, --path <path>', 'Répertoire des workflows', '.')
    .action((options) => {
    try {
        const wfPath = path.join(options.path, options.workflow);
        const workflowFile = path.join(wfPath, 'workflow.knime');
        if (!fs.existsSync(workflowFile)) {
            console.error(chalk_1.default.red(`❌ Workflow ${options.workflow} non trouvé.`));
            process.exit(1);
        }
        const [sourceID, sourcePort] = options.from.split(':').map(Number);
        const [destID, destPort] = options.to.split(':').map(Number);
        if (isNaN(sourceID) || isNaN(sourcePort) || isNaN(destID) || isNaN(destPort)) {
            throw new Error('Format invalide pour --from ou --to (attendu nodeId:port)');
        }
        const xml = fs.readFileSync(workflowFile, 'utf8');
        const jsonObj = parser.parse(xml);
        if (!jsonObj.config.config)
            jsonObj.config.config = [];
        let connectionsConfig = jsonObj.config.config.find((c) => c['@_key'] === 'connections');
        if (!connectionsConfig) {
            connectionsConfig = { '@_key': 'connections', config: [] };
            jsonObj.config.config.push(connectionsConfig);
        }
        if (!connectionsConfig.config)
            connectionsConfig.config = [];
        if (!Array.isArray(connectionsConfig.config)) {
            connectionsConfig.config = [connectionsConfig.config];
        }
        const connId = connectionsConfig.config.length;
        connectionsConfig.config.push({
            '@_key': `connection_${connId}`,
            'entry': [
                { '@_key': 'sourceID', '@_type': 'xint', '@_value': sourceID },
                { '@_key': 'destID', '@_type': 'xint', '@_value': destID },
                { '@_key': 'sourcePort', '@_type': 'xint', '@_value': sourcePort },
                { '@_key': 'destPort', '@_type': 'xint', '@_value': destPort }
            ]
        });
        fs.writeFileSync(workflowFile, builder.build(jsonObj));
        console.log(chalk_1.default.green(`✅ Connexion établie : ${sourceID}:${sourcePort} -> ${destID}:${destPort}`));
    }
    catch (err) {
        console.error(chalk_1.default.red(`❌ Erreur lors de la connexion : ${err.message}`));
        process.exit(1);
    }
});
//# sourceMappingURL=connect.js.map