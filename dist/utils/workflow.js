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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isKnimeWorkflow = isKnimeWorkflow;
exports.findWorkflowRecursive = findWorkflowRecursive;
exports.resolveWorkflowPath = resolveWorkflowPath;
exports.getWorkflowMetadata = getWorkflowMetadata;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const knime_parser_1 = require("./knime-parser");
const AdmZip = require("adm-zip");
/**
 * Vérifie si un dossier est un workflow KNIME.
 */
function isKnimeWorkflow(dirPath) {
    try {
        return fs.existsSync(path.join(dirPath, 'workflow.knime'));
    }
    catch {
        return false;
    }
}
/**
 * Recherche récursivement un workflow par son nom dans un dossier de base.
 */
function findWorkflowRecursive(workflowName, basePath) {
    if (!fs.existsSync(basePath))
        return null;
    // Si c'est déjà le dossier du workflow
    if (isKnimeWorkflow(basePath) && path.basename(basePath) === workflowName) {
        return basePath;
    }
    const entries = fs.readdirSync(basePath, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(basePath, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === workflowName && isKnimeWorkflow(fullPath)) {
                return fullPath;
            }
            const found = findWorkflowRecursive(workflowName, fullPath);
            if (found)
                return found;
        }
        else if (entry.isFile() && entry.name === `${workflowName}.knwf`) {
            return fullPath;
        }
    }
    return null;
}
/**
 * Résout le chemin du workflow et détecte son type (fichier ou dossier).
 * Supporte désormais la recherche récursive si non trouvé au premier niveau.
 */
function resolveWorkflowPath(workflow, basePath) {
    const root = basePath || '.';
    // 1. Essai direct
    let targetPath = path.isAbsolute(workflow)
        ? workflow
        : path.join(root, workflow);
    // 2. Si non trouvé, recherche récursive par nom
    if (!fs.existsSync(targetPath)) {
        const found = findWorkflowRecursive(workflow, root);
        if (found) {
            targetPath = found;
        }
        else {
            throw new Error(`Workflow not found: ${workflow}. Tried direct path and recursive search in ${path.resolve(root)}`);
        }
    }
    const stats = fs.statSync(targetPath);
    if (stats.isFile() && targetPath.endsWith('.knwf')) {
        return { targetPath, workflowArg: '-workflowFile' };
    }
    else if (stats.isDirectory() && isKnimeWorkflow(targetPath)) {
        return { targetPath, workflowArg: '-workflowDir' };
    }
    else {
        throw new Error(`Path is not a valid KNIME workflow: ${targetPath}. Must be a .knwf file or a directory containing workflow.knime`);
    }
}
/**
 * Récupère les métadonnées d'un workflow (depuis ZIP ou dossier).
 */
async function getWorkflowMetadata(workflow, basePath) {
    const { targetPath, workflowArg } = resolveWorkflowPath(workflow, basePath);
    if (workflowArg === '-workflowFile') {
        const zip = new AdmZip(targetPath);
        const workflowKnime = zip.getEntries().find(e => e.entryName.endsWith('workflow.knime'));
        if (!workflowKnime)
            throw new Error('Could not find workflow.knime in ZIP');
        return (0, knime_parser_1.parseWorkflowMetadata)(workflowKnime.getData().toString('utf8'), path.basename(targetPath));
    }
    else {
        const xmlPath = path.join(targetPath, 'workflow.knime');
        const xmlData = fs.readFileSync(xmlPath, { encoding: 'utf8' });
        return (0, knime_parser_1.parseWorkflowMetadata)(xmlData, path.basename(targetPath));
    }
}
//# sourceMappingURL=workflow.js.map