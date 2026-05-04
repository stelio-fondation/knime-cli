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
exports.reportCommand = void 0;
const commander_1 = require("commander");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const workflow_1 = require("../utils/workflow");
const knime_parser_1 = require("../utils/knime-parser");
const fs_1 = require("../utils/fs");
const adm_zip_1 = __importDefault(require("adm-zip"));
exports.reportCommand = new commander_1.Command('report')
    .description('Génère un rapport détaillé (Markdown) du workflow')
    .requiredOption('-w, --workflow <name>', 'Nom du workflow')
    .option('-p, --path <path>', 'Chemin du dossier de recherche', '.')
    .option('-o, --output <file>', 'Fichier de sortie', 'REPORT.md')
    .action(async (options) => {
    const spinner = (0, ora_1.default)(`Génération du rapport pour ${chalk_1.default.cyan(options.workflow)}...`).start();
    try {
        const target = (0, workflow_1.resolveWorkflowPath)(options.workflow, options.path);
        const isDir = target.workflowArg === '-workflowDir';
        let xmlData = '';
        if (isDir) {
            xmlData = fs.readFileSync(path.join(target.targetPath, 'workflow.knime'), 'utf8');
        }
        else {
            const zip = new adm_zip_1.default(target.targetPath);
            const knimeEntry = zip.getEntries().find((e) => e.entryName.endsWith('workflow.knime'));
            if (knimeEntry)
                xmlData = zip.readAsText(knimeEntry);
        }
        if (!xmlData)
            throw new Error('Workflow metadata not found.');
        const metadata = (0, knime_parser_1.parseWorkflowMetadata)(xmlData, options.workflow);
        let report = `# Workflow Report: ${metadata.name}\n\n`;
        report += `## General Information\n`;
        report += `- **Author:** ${metadata.author}\n`;
        report += `- **KNIME Version:** ${metadata.version}\n`;
        report += `- **Description:** ${metadata.description || 'N/A'}\n\n`;
        report += `## Statistics\n`;
        report += `- **Nodes:** ${metadata.nodes.length}\n`;
        report += `- **Connections:** ${metadata.connections.length}\n`;
        report += `- **Workflow Variables:** ${metadata.variables.length}\n`;
        report += `- **Required Bundles:** ${metadata.bundles.length}\n\n`;
        report += `## Nodes List\n`;
        metadata.nodes.forEach(n => {
            report += `- [${n.id}] ${n.name}\n`;
        });
        report += `\n`;
        if (metadata.variables.length > 0) {
            report += `## Workflow Variables\n`;
            report += `| Name | Type | Value |\n`;
            report += `| --- | --- | --- |\n`;
            metadata.variables.forEach(v => {
                report += `| ${v.name} | ${v.type} | ${v.value} |\n`;
            });
            report += `\n`;
        }
        if (metadata.bundles.length > 0) {
            report += `## Required Extensions (Bundles)\n`;
            metadata.bundles.forEach(b => {
                report += `- ${b.name} (${b.version})\n`;
            });
            report += `\n`;
        }
        if (isDir) {
            const allFiles = (0, fs_1.getAllFiles)(target.targetPath);
            const largeFiles = allFiles.filter(f => f.size > 10 * 1024 * 1024); // > 10MB
            if (largeFiles.length > 0) {
                report += `## Warnings (Large Files)\n`;
                largeFiles.forEach(f => {
                    const relPath = path.relative(target.targetPath, f.path);
                    report += `- \`${relPath}\` (${(f.size / 1024 / 1024).toFixed(2)} MB)\n`;
                });
                report += `\n`;
            }
        }
        report += `---\n*Generated by KNIME CLI on ${new Date().toLocaleString()}*\n`;
        fs.writeFileSync(options.output, report);
        spinner.succeed(chalk_1.default.green(`Rapport généré avec succès : ${chalk_1.default.bold(options.output)}`));
    }
    catch (err) {
        spinner.fail(chalk_1.default.red(`Erreur lors de la génération du rapport : ${err.message}`));
        process.exit(1);
    }
});
//# sourceMappingURL=report.js.map