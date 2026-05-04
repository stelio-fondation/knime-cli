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
exports.lineageCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const knime_parser_1 = require("../utils/knime-parser");
exports.lineageCommand = new commander_1.Command('lineage')
    .description('Affiche le lignage des données (flux entre les nœuds)')
    .requiredOption('-w, --workflow <name>', 'Workflow à analyser')
    .option('-p, --path <path>', 'Chemin vers le dossier contenant le workflow', '.')
    .action((options) => {
    const workflowDir = path.join(options.path, options.workflow);
    const knimeFile = path.join(workflowDir, 'workflow.knime');
    if (!fs.existsSync(knimeFile)) {
        console.error(chalk_1.default.red(`Erreur : Fichier workflow.knime non trouvé dans ${workflowDir}`));
        process.exit(1);
    }
    const xmlData = fs.readFileSync(knimeFile, 'utf8');
    const meta = (0, knime_parser_1.parseWorkflowMetadata)(xmlData, options.workflow);
    console.log(chalk_1.default.blue.bold(`\n📊 Lignage des données pour : ${meta.name}\n`));
    if (meta.connections.length === 0) {
        console.log(chalk_1.default.yellow('  Aucune connexion trouvée.'));
        return;
    }
    meta.connections.forEach((conn, index) => {
        const srcNode = meta.nodes.find(n => n.id === conn.sourceID);
        const destNode = meta.nodes.find(n => n.id === conn.destID);
        const srcName = srcNode ? srcNode.name : `Node ${conn.sourceID}`;
        const destName = destNode ? destNode.name : `Node ${conn.destID}`;
        console.log(`  ${chalk_1.default.cyan(index + 1 + '.')} ${chalk_1.default.green(srcName)} (${conn.sourceID}) ${chalk_1.default.gray('-->')} ${chalk_1.default.yellow(destName)} (${conn.destID})`);
    });
    console.log('');
});
//# sourceMappingURL=lineage.js.map