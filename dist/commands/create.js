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
exports.createCommand = void 0;
const commander_1 = require("commander");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const chalk_1 = __importDefault(require("chalk"));
exports.createCommand = new commander_1.Command('create')
    .description('Initialise un nouveau workflow KNIME')
    .argument('<name>', 'Nom du workflow')
    .option('-p, --path <path>', 'Répertoire de destination', '.')
    .action((name, options) => {
    try {
        const wfPath = path.join(options.path, name);
        if (fs.existsSync(wfPath)) {
            console.error(chalk_1.default.red(`❌ Le dossier ${wfPath} existe déjà.`));
            process.exit(1);
        }
        fs.mkdirSync(wfPath, { recursive: true });
        // Copy template
        const templatePath = path.resolve(__dirname, '../resources/templates/workflow.knime.template');
        if (!fs.existsSync(templatePath)) {
            // Fallback for dev environment
            const devTemplatePath = path.resolve(__dirname, '../../src/resources/templates/workflow.knime.template');
            if (fs.existsSync(devTemplatePath)) {
                copyTemplate(devTemplatePath, wfPath, name);
            }
            else {
                throw new Error(`Template not found at ${templatePath}`);
            }
        }
        else {
            copyTemplate(templatePath, wfPath, name);
        }
        console.log(chalk_1.default.green(`✅ Workflow ${name} initialisé dans ${wfPath}`));
    }
    catch (err) {
        console.error(chalk_1.default.red(`❌ Erreur lors de la création : ${err.message}`));
        process.exit(1);
    }
});
function copyTemplate(src, dest, name) {
    let content = fs.readFileSync(src, 'utf8');
    content = content.replace('{{NAME}}', name)
        .replace('{{DATE}}', new Date().toISOString());
    fs.writeFileSync(path.join(dest, 'workflow.knime'), content);
}
//# sourceMappingURL=create.js.map