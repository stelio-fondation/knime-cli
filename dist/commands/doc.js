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
exports.docCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const workflow_1 = require("../utils/workflow");
exports.docCommand = new commander_1.Command('doc')
    .description('Génère une documentation Markdown et un diagramme Mermaid du workflow')
    .requiredOption('-w, --workflow <name>', 'Nom du workflow')
    .option('-p, --path <path>', 'Chemin du dossier contenant le workflow', '.')
    .option('-o, --output <file>', 'Fichier de sortie (default: README.md dans le dossier du workflow)')
    .action(async (options) => {
    try {
        const metadata = await (0, workflow_1.getWorkflowMetadata)(options.workflow, options.path);
        let markdown = `# Workflow : ${metadata.name}\n\n`;
        markdown += `> **Auteur** : ${metadata.author}  \n`;
        markdown += `> **Version** : ${metadata.version}  \n\n`;
        if (metadata.description) {
            markdown += `## Description\n${metadata.description}\n\n`;
        }
        if (metadata.annotations && metadata.annotations.length > 0) {
            markdown += `## Documentation (Annotations)\n`;
            metadata.annotations.forEach(ann => {
                markdown += `> ${ann}\n\n`;
            });
        }
        markdown += `## Diagramme de Flux\n\n`;
        markdown += `\`\`\`mermaid\ngraph LR\n`;
        // Définir les nœuds dans Mermaid
        metadata.nodes.forEach(node => {
            // Nettoyer le nom pour Mermaid
            const cleanName = node.name.replace(/["()]/g, '');
            markdown += `    Node${node.id}["${cleanName} (#${node.id})"]\n`;
        });
        // Définir les connexions
        metadata.connections.forEach(conn => {
            markdown += `    Node${conn.sourceID} --> Node${conn.destID}\n`;
        });
        markdown += `\`\`\`\n\n`;
        markdown += `## Liste des Nœuds\n\n`;
        metadata.nodes.forEach(node => {
            markdown += `- **#${node.id}** : ${node.name}\n`;
        });
        const outputPath = options.output || path.join(options.path, options.workflow, 'README.md');
        fs.writeFileSync(outputPath, markdown, { encoding: 'utf8' });
        console.log(chalk_1.default.green(`\n✅ Documentation générée avec succès : ${chalk_1.default.bold(outputPath)}`));
        console.log(chalk_1.default.blue(`💡 Vous pouvez visualiser le diagramme sur : https://mermaid.live`));
    }
    catch (err) {
        console.error(chalk_1.default.red(`❌ Erreur : ${err.message}`));
        process.exit(1);
    }
});
//# sourceMappingURL=doc.js.map