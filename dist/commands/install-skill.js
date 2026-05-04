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
exports.installSkillCommand = void 0;
const commander_1 = require("commander");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const chalk_1 = __importDefault(require("chalk"));
exports.installSkillCommand = new commander_1.Command('install-skill')
    .description('Déploie knime-cli en tant que skill dans les environnements globaux des agents IA (Antigravity, Claude Code, Opencode, Hermes)')
    .option('--dry-run', 'Affiche les chemins sans copier les fichiers')
    .option('--force-all', 'Crée de force les répertoires d\'agents manquants')
    .option('--path <dir>', 'Spécifie un chemin personnalisé pour installer la skill')
    .action(async (options) => {
    try {
        console.log(chalk_1.default.blue('🔍 Recherche des environnements d\'agents IA...'));
        const home = os.homedir();
        // Répertoires racines où les agents stockent généralement leurs skills
        const skillTargets = [
            { name: 'Antigravity / Gemini', path: path.join(home, '.gemini', 'antigravity', 'skills') },
            { name: 'Claude Code', path: path.join(home, '.claudecode', 'skills') },
            { name: 'Opencode', path: path.join(home, '.opencode', 'skills') },
            { name: 'Hermes', path: path.join(home, '.hermes', 'skills') },
        ];
        if (options.path) {
            skillTargets.push({ name: 'Chemin Personnalisé', path: path.resolve(options.path) });
        }
        // Localisation de SKILL.md dans le package npm (../.. car ce fichier sera dans dist/commands/)
        const skillSourcePath = path.join(__dirname, '..', '..', 'SKILL.md');
        if (!fs.existsSync(skillSourcePath)) {
            console.error(chalk_1.default.red(`❌ Impossible de trouver le fichier SKILL.md à l'emplacement : ${skillSourcePath}`));
            process.exit(1);
        }
        let installedCount = 0;
        for (const target of skillTargets) {
            // Si --force-all est actif, on crée le dossier racine de la skill s'il n'existe pas
            if (options.forceAll && !fs.existsSync(target.path)) {
                fs.mkdirSync(target.path, { recursive: true });
            }
            if (fs.existsSync(target.path)) {
                const destDir = path.join(target.path, 'knime-cli');
                const destFile = path.join(destDir, 'SKILL.md');
                console.log(chalk_1.default.yellow(`\nAgent détecté : ${target.name}`));
                console.log(chalk_1.default.gray(`-> Cible : ${destDir}`));
                if (options.dryRun) {
                    console.log(chalk_1.default.green(`[DRY-RUN] Copierait ${skillSourcePath} vers ${destFile}`));
                    installedCount++;
                }
                else {
                    if (!fs.existsSync(destDir)) {
                        fs.mkdirSync(destDir, { recursive: true });
                    }
                    fs.copyFileSync(skillSourcePath, destFile);
                    console.log(chalk_1.default.green(`✅ Skill déployée avec succès pour ${target.name}`));
                    installedCount++;
                }
            }
        }
        if (installedCount === 0) {
            console.log(chalk_1.default.yellow('\n⚠️ Aucun répertoire de skill d\'agent IA connu n\'a été détecté sur cette machine.'));
        }
        else {
            console.log(chalk_1.default.cyan(`\n🎉 Opération terminée ! (${installedCount} agent(s) mis à jour)`));
        }
    }
    catch (error) {
        console.error(chalk_1.default.red(`❌ Erreur lors du déploiement : ${error.message}`));
        process.exit(1);
    }
});
//# sourceMappingURL=install-skill.js.map