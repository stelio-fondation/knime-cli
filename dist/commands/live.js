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
exports.liveCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const express_1 = __importDefault(require("express"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const fast_xml_parser_1 = require("fast-xml-parser");
exports.liveCommand = new commander_1.Command('live')
    .description('Démarre le serveur de pilotage live pour modifier le workflow en temps réel')
    .requiredOption('-w, --workflow <name>', 'Workflow à piloter')
    .option('-p, --path <path>', 'Chemin du workflow', '.')
    .option('--port <port>', 'Port du serveur', '3000')
    .action((options) => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    const workflowPath = path.join(options.path, options.workflow, 'workflow.knime');
    if (!fs.existsSync(workflowPath)) {
        console.error(chalk_1.default.red(`❌ Workflow introuvable : ${workflowPath}`));
        process.exit(1);
    }
    console.log(chalk_1.default.blue.bold('\n🚀 KNIME Live Pilot démarré !'));
    console.log(chalk_1.default.gray(`Workflow : ${workflowPath}`));
    console.log(chalk_1.default.gray(`Port : ${options.port}`));
    console.log(chalk_1.default.yellow('\nEn attente de commandes de pilotage...'));
    // Endpoint pour recevoir des commandes de pilotage
    app.post('/pilot', (req, res) => {
        const { action, data } = req.body;
        try {
            if (action === 'add_annotation') {
                addAnnotation(workflowPath, data.text, data.x, data.y);
                console.log(chalk_1.default.green(`✅ Annotation ajoutée : "${data.text.substring(0, 20)}..."`));
                return res.json({ status: 'ok', message: 'Annotation ajoutée' });
            }
            res.status(400).json({ status: 'error', message: 'Action inconnue' });
        }
        catch (err) {
            console.error(chalk_1.default.red(`❌ Erreur pilotage : ${err.message}`));
            res.status(500).json({ status: 'error', message: err.message });
        }
    });
    app.listen(options.port);
});
/**
 * Logique de manipulation XML pour ajouter une annotation
 */
function addAnnotation(filePath, text, x = 0, y = 0) {
    const xmlData = fs.readFileSync(filePath, 'utf8');
    const parser = new fast_xml_parser_1.XMLParser({ ignoreAttributes: false });
    const builder = new fast_xml_parser_1.XMLBuilder({ ignoreAttributes: false, format: true });
    const jsonObj = parser.parse(xmlData);
    if (!jsonObj.config)
        jsonObj.config = { config: [] };
    let configs = Array.isArray(jsonObj.config.config) ? jsonObj.config.config : [jsonObj.config.config];
    let annotationsConfig = configs.find((c) => c['@_key'] === 'annotations');
    if (!annotationsConfig) {
        annotationsConfig = { '@_key': 'annotations', config: [] };
        if (!Array.isArray(jsonObj.config.config))
            jsonObj.config.config = [];
        jsonObj.config.config.push(annotationsConfig);
    }
    const existingAnnotations = Array.isArray(annotationsConfig.config) ? annotationsConfig.config : (annotationsConfig.config ? [annotationsConfig.config] : []);
    const nextId = existingAnnotations.length;
    const newAnnotation = {
        '@_key': `annotation_${nextId}`,
        entry: [
            { '@_key': 'text', '@_type': 'xstring', '@_value': text },
            { '@_key': 'bgcolor', '@_type': 'xint', '@_value': '16777215' },
            { '@_key': 'x-coordinate', '@_type': 'xint', '@_value': x.toString() },
            { '@_key': 'y-coordinate', '@_type': 'xint', '@_value': y.toString() },
            { '@_key': 'width', '@_type': 'xint', '@_value': '200' },
            { '@_key': 'height', '@_type': 'xint', '@_value': '100' }
        ]
    };
    if (!Array.isArray(annotationsConfig.config))
        annotationsConfig.config = [];
    annotationsConfig.config.push(newAnnotation);
    const newXml = builder.build(jsonObj);
    fs.writeFileSync(filePath, '<?xml version="1.0" encoding="UTF-8"?>\n' + newXml, { encoding: 'utf8' });
}
//# sourceMappingURL=live.js.map