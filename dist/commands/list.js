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
exports.listCommand = void 0;
const commander_1 = require("commander");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function isKnimeWorkflow(dirPath) {
    try {
        const entries = fs.readdirSync(dirPath);
        return entries.includes('workflow.knime');
    }
    catch {
        return false;
    }
}
function getWorkflowSize(dirPath) {
    let totalSize = 0;
    try {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            if (entry.isFile()) {
                totalSize += fs.statSync(fullPath).size;
            }
            else if (entry.isDirectory()) {
                totalSize += getWorkflowSize(fullPath);
            }
        }
    }
    catch {
        // ignore
    }
    return totalSize;
}
function scanDirectory(dirPath, fullPath = false) {
    const workflows = [];
    if (!fs.existsSync(dirPath)) {
        console.error(`Error: Directory not found: ${dirPath}`);
        process.exit(1);
    }
    if (isKnimeWorkflow(dirPath)) {
        const stats = fs.statSync(dirPath);
        workflows.push({
            name: path.basename(dirPath).replace('.knwf', ''),
            path: dirPath,
            size: getWorkflowSize(dirPath),
            modified: stats.mtime,
        });
        return workflows;
    }
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
        const fullEntryPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            const subWorkflows = scanDirectory(fullEntryPath, fullPath);
            for (const wf of subWorkflows) {
                const wfName = fullPath
                    ? `${entry.name}/${wf.name}`
                    : wf.name;
                workflows.push({
                    ...wf,
                    name: wfName,
                });
            }
        }
    }
    return workflows.sort((a, b) => a.name.localeCompare(b.name));
}
function formatSize(bytes) {
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
exports.listCommand = new commander_1.Command('list')
    .description('Liste les workflows KNIME')
    .option('-p, --path <path>', 'Chemin du dossier contenant les workflows', '.')
    .option('-r, --recursive', 'Affiche le chemin complet des workflows')
    .action(async (options) => {
    const workflows = scanDirectory(options.path, options.recursive || false);
    if (workflows.length === 0) {
        console.log('No workflows found.');
        return;
    }
    console.log(`\nFound ${workflows.length} workflow(s):\n`);
    console.log('Name'.padEnd(30) + 'Size'.padEnd(12) + 'Modified');
    console.log('-'.repeat(60));
    for (const wf of workflows) {
        console.log(wf.name.padEnd(30) +
            formatSize(wf.size).padEnd(12) +
            wf.modified.toISOString().split('T')[0]);
    }
    console.log('');
});
//# sourceMappingURL=list.js.map