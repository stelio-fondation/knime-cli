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
exports.resolveWorkflowPath = resolveWorkflowPath;
exports.getWorkflowMetadata = getWorkflowMetadata;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const knime_parser_1 = require("./knime-parser");
const AdmZip = require("adm-zip");
/**
 * Résout le chemin du workflow et détecte son type (fichier ou dossier).
 */
function resolveWorkflowPath(workflow, basePath) {
    const targetPath = path.isAbsolute(workflow)
        ? workflow
        : path.join(basePath || '.', workflow);
    if (!fs.existsSync(targetPath)) {
        throw new Error(`Workflow not found: ${targetPath}`);
    }
    const stats = fs.statSync(targetPath);
    if (stats.isFile() && targetPath.endsWith('.knwf')) {
        return { targetPath, workflowArg: '-workflowFile' };
    }
    else if (stats.isDirectory() && fs.existsSync(path.join(targetPath, 'workflow.knime'))) {
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
        const xmlData = fs.readFileSync(xmlPath, 'utf8');
        return (0, knime_parser_1.parseWorkflowMetadata)(xmlData, path.basename(targetPath));
    }
}
//# sourceMappingURL=workflow.js.map