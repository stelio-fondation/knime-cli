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
exports.infoCommand = void 0;
const commander_1 = require("commander");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const adm_zip_1 = __importDefault(require("adm-zip"));
const workflow_1 = require("../utils/workflow");
const knime_parser_1 = require("../utils/knime-parser");
function displayInfo(metadata, systemInfo) {
    console.log('\n=== Workflow System Info ===');
    console.log(`Path:      ${systemInfo.path}`);
    console.log(`Size:      ${(systemInfo.size / 1024).toFixed(2)} KB`);
    console.log(`Modified:  ${systemInfo.mtime.toLocaleString()}`);
    console.log('\n=== KNIME Metadata ===');
    console.log(`Name:      ${metadata.name}`);
    console.log(`Author:    ${metadata.author}`);
    console.log(`Version:   ${metadata.version}`);
    if (metadata.description) {
        console.log(`Description: ${metadata.description}`);
    }
    if (metadata.nodes.length > 0) {
        console.log(`\n=== Nodes (Total: ${metadata.nodes.length}) ===`);
        metadata.nodes.forEach(n => {
            console.log(`[${n.id}] ${n.name}`);
        });
    }
    else {
        console.log('\n=== Nodes ===');
        console.log('No nodes found or empty workflow.');
    }
    console.log('');
}
function getWorkflowInfo(targetPath, isDir) {
    const stats = fs.statSync(targetPath);
    const fallbackName = path.basename(targetPath, path.extname(targetPath));
    let xmlData = '';
    if (isDir) {
        const knimeFile = path.join(targetPath, 'workflow.knime');
        if (fs.existsSync(knimeFile)) {
            xmlData = fs.readFileSync(knimeFile, 'utf8');
        }
    }
    else {
        try {
            const zip = new adm_zip_1.default(targetPath);
            const zipEntries = zip.getEntries();
            // Chercher workflow.knime (peut être préfixé par le nom du workflow dans le ZIP)
            const knimeEntry = zipEntries.find(e => e.entryName.endsWith('workflow.knime'));
            if (knimeEntry) {
                xmlData = zip.readAsText(knimeEntry);
            }
        }
        catch (err) {
            console.warn('\n[Warning] Could not read .knwf archive.');
        }
    }
    if (xmlData) {
        try {
            const metadata = (0, knime_parser_1.parseWorkflowMetadata)(xmlData, fallbackName);
            displayInfo(metadata, { path: targetPath, size: stats.size, mtime: stats.mtime });
        }
        catch (err) {
            console.error('\nError: Failed to parse KNIME metadata.');
        }
    }
    else {
        console.log('\n=== Workflow System Info ===');
        console.log(`Path:      ${targetPath}`);
        console.log(`Size:      ${(stats.size / 1024).toFixed(2)} KB`);
        console.log(`Modified:  ${stats.mtime.toLocaleString()}`);
        console.log('\n[Warning] No KNIME metadata found.');
    }
}
exports.infoCommand = new commander_1.Command('info')
    .description('Affiche les détails d\'un workflow KNIME')
    .requiredOption('-w, --workflow <name>', 'Nom du workflow')
    .option('-p, --path <path>', 'Chemin du dossier contenant le workflow', '.')
    .action(async (options) => {
    try {
        const target = (0, workflow_1.resolveWorkflowPath)(options.workflow, options.path);
        getWorkflowInfo(target.targetPath, target.workflowArg === '-workflowDir');
    }
    catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
});
//# sourceMappingURL=info.js.map