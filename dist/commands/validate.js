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
exports.validateCommand = void 0;
const commander_1 = require("commander");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const workflow_1 = require("../utils/workflow");
const knime_parser_1 = require("../utils/knime-parser");
const fs_1 = require("../utils/fs");
const adm_zip_1 = __importDefault(require("adm-zip"));
exports.validateCommand = new commander_1.Command('validate')
    .description('Valide la structure d\'un workflow KNIME et détecte les fichiers volumineux')
    .requiredOption('-w, --workflow <name>', 'Nom du workflow')
    .option('-p, --path <path>', 'Chemin du dossier de recherche', '.')
    .option('--threshold <mb>', 'Seuil d\'alerte pour les fichiers volumineux (Mo)', '10')
    .action(async (options) => {
    const thresholdBytes = parseFloat(options.threshold) * 1024 * 1024;
    let isValid = true;
    let hasWarnings = false;
    const spinner = (0, ora_1.default)(`Validating workflow: ${chalk_1.default.cyan(options.workflow)}...`).start();
    try {
        // 1. Résolution du chemin
        const target = (0, workflow_1.resolveWorkflowPath)(options.workflow, options.path);
        const isDir = target.workflowArg === '-workflowDir';
        // 2. Lecture des métadonnées
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
        if (!xmlData) {
            throw new Error('Workflow metadata file (workflow.knime) not found.');
        }
        const metadata = (0, knime_parser_1.parseWorkflowMetadata)(xmlData, options.workflow);
        spinner.info(chalk_1.default.green('Structure base: OK'));
        // 3. Vérification des nœuds (Mode dossier seulement)
        if (isDir) {
            let missingNodes = 0;
            metadata.nodes.forEach(node => {
                const nodeDir = path.join(target.targetPath, `${node.name} (#${node.id})`);
                if (!fs.existsSync(nodeDir)) {
                    console.error(chalk_1.default.red(`   ❌ Missing node directory: ${node.name} (#${node.id})`));
                    missingNodes++;
                }
                else if (!fs.existsSync(path.join(nodeDir, 'settings.xml'))) {
                    console.error(chalk_1.default.red(`   ❌ Missing settings.xml in node: ${node.name} (#${node.id})`));
                    missingNodes++;
                }
            });
            if (missingNodes === 0) {
                spinner.info(chalk_1.default.green(`Node consistency: OK (${metadata.nodes.length}/${metadata.nodes.length})`));
            }
            else {
                isValid = false;
                spinner.warn(chalk_1.default.red(`Node consistency: FAILED (${missingNodes} missing)`));
            }
            // 4. Scan des fichiers volumineux
            spinner.start('Scanning for large files...');
            const allFiles = (0, fs_1.getAllFiles)(target.targetPath);
            const largeFiles = allFiles.filter(f => f.size > thresholdBytes);
            if (largeFiles.length > 0) {
                spinner.warn(chalk_1.default.yellow(`Found ${largeFiles.length} large file(s) (> ${options.threshold} MB):`));
                largeFiles.forEach(f => {
                    const relPath = path.relative(target.targetPath, f.path);
                    console.warn(chalk_1.default.gray(`   - ${relPath} (${chalk_1.default.yellow((f.size / 1024 / 1024).toFixed(2))} MB)`));
                });
                hasWarnings = true;
            }
            else {
                spinner.succeed(chalk_1.default.green('No large files detected.'));
            }
        }
        else {
            spinner.info(chalk_1.default.gray('Large file scan skipped (archive mode)'));
        }
        // Rapport Final
        console.log(chalk_1.default.gray('\n-----------------------------------'));
        console.log(`${chalk_1.default.blue('ℹ')} Nodes: ${metadata.nodes.length} | Connections: ${metadata.connections.length} | Variables: ${metadata.variables.length}`);
        if (metadata.bundles.length > 0) {
            console.log(`\n${chalk_1.default.bold.blue('=== Requirements ===')}`);
            metadata.bundles.forEach(b => {
                console.log(`  - ${b.name} (${b.version})`);
            });
        }
        if (!isValid) {
            console.log(`${chalk_1.default.bold('Final Status:')} ${chalk_1.default.bold.red('INVALID ❌')}`);
            process.exit(1);
        }
        else if (hasWarnings) {
            console.log(`${chalk_1.default.bold('Final Status:')} ${chalk_1.default.bold.yellow('VALID (with warnings) ⚠️')}`);
        }
        else {
            console.log(`${chalk_1.default.bold('Final Status:')} ${chalk_1.default.bold.green('VALID ✅')}`);
        }
    }
    catch (err) {
        spinner.fail(chalk_1.default.red(`Validation failed: ${err.message}`));
        process.exit(1);
    }
});
//# sourceMappingURL=validate.js.map