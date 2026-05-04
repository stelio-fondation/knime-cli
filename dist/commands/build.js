"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
exports.buildCommand = new commander_1.Command('build')
    .description('Génère un workflow à partir d\'une description (prompt)')
    .requiredOption('-w, --workflow <name>', 'Nom du workflow')
    .requiredOption('--prompt <text>', 'Description du workflow')
    .action((options) => {
    console.log(chalk_1.default.blue(`🤖 Analyse du prompt : "${options.prompt}"...`));
    const nodes = [];
    const prompt = options.prompt.toLowerCase();
    // Mapping Heuristique Simple
    if ((prompt.includes('csv') || prompt.includes('fichier')) && (prompt.includes('lit') || prompt.includes('read') || prompt.includes('lecture'))) {
        nodes.push('CSV Reader');
    }
    else if ((prompt.includes('excel') || prompt.includes('xlsx')) && (prompt.includes('lit') || prompt.includes('read'))) {
        nodes.push('Excel Reader');
    }
    else if (prompt.includes('créer') || prompt.includes('table') || prompt.includes('input')) {
        nodes.push('Table Creator');
    }
    if (prompt.includes('filtre') || prompt.includes('filter') || prompt.includes('exclure')) {
        nodes.push('Row Filter');
    }
    if (prompt.includes('groupe') || prompt.includes('group') || prompt.includes('agrège') || prompt.includes('sum')) {
        nodes.push('GroupBy');
    }
    if (prompt.includes('jointure') || prompt.includes('join') || prompt.includes('fusion')) {
        nodes.push('Joiner');
    }
    if ((prompt.includes('csv') || prompt.includes('fichier')) && (prompt.includes('écrit') || prompt.includes('write') || prompt.includes('sauve'))) {
        nodes.push('CSV Writer');
    }
    else if ((prompt.includes('excel') || prompt.includes('xlsx')) && (prompt.includes('écrit') || prompt.includes('write'))) {
        nodes.push('Excel Writer');
    }
    if (nodes.length === 0) {
        console.log(chalk_1.default.yellow("⚠️ Aucun composant reconnu dans le prompt. Création d'un workflow vide."));
    }
    else {
        console.log(chalk_1.default.blue(`🚀 Construction du workflow avec : ${nodes.join(' -> ')}`));
    }
    try {
        const cli = 'node dist/index.js';
        // On s'assure que le CLI est buildé
        // Note: On utilise dist/index.js car on suppose que l'utilisateur a buildé ou utilise le binaire installé.
        (0, child_process_1.execSync)(`${cli} create ${options.workflow}`, { stdio: 'inherit' });
        nodes.forEach((type, index) => {
            const id = index + 1;
            (0, child_process_1.execSync)(`${cli} add-node -w ${options.workflow} -t "${type}" -i ${id}`, { stdio: 'inherit' });
            if (id > 1) {
                (0, child_process_1.execSync)(`${cli} connect -w ${options.workflow} --from ${id - 1}:1 --to ${id}:1`, { stdio: 'inherit' });
            }
        });
        console.log(chalk_1.default.green(`\n🎉 Workflow "${options.workflow}" généré avec succès !`));
        console.log(chalk_1.default.gray(`Conseil : Utilisez 'knime info -w ${options.workflow}' pour vérifier la structure.`));
    }
    catch (err) {
        console.error(chalk_1.default.red(`❌ Erreur lors de la construction : ${err.message}`));
    }
});
//# sourceMappingURL=build.js.map