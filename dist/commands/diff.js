"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.diffCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const workflow_1 = require("../utils/workflow");
exports.diffCommand = new commander_1.Command('diff')
    .description('Compare deux workflows KNIME et affiche les différences structurelles')
    .requiredOption('--w1 <name>', 'Premier workflow')
    .requiredOption('--w2 <name>', 'Deuxième workflow')
    .option('--p1 <path>', 'Chemin du premier workflow', '.')
    .option('--p2 <path>', 'Chemin du deuxième workflow', '.')
    .option('--html <file>', 'Génère un rapport de comparaison au format HTML')
    .action(async (options) => {
    try {
        console.log(chalk_1.default.bold(`\nComparing workflows...`));
        console.log(`${chalk_1.default.gray('W1:')} ${options.w1}`);
        console.log(`${chalk_1.default.gray('W2:')} ${options.w2}\n`);
        const meta1 = await (0, workflow_1.getWorkflowMetadata)(options.w1, options.p1);
        const meta2 = await (0, workflow_1.getWorkflowMetadata)(options.w2, options.p2);
        let htmlReport = `
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    .added { background-color: #e6ffed; color: #22863a; }
    .removed { background-color: #ffeef0; color: #cb2431; }
    .changed { background-color: #fff5b1; color: #b08800; }
  </style>
</head>
<body>
  <h2>Workflow Diff: ${options.w1} vs ${options.w2}</h2>
`;
        let nodesHtml = `<h3>Nodes</h3><table><tr><th>ID</th><th>Status</th><th>Details</th></tr>`;
        // 1. Comparaison des Nœuds
        console.log(chalk_1.default.bold.blue('=== Nodes Comparison ==='));
        const nodes1 = new Map(meta1.nodes.map(n => [n.id, n.name]));
        const nodes2 = new Map(meta2.nodes.map(n => [n.id, n.name]));
        const allIds = Array.from(new Set([...nodes1.keys(), ...nodes2.keys()])).sort((a, b) => parseInt(a) - parseInt(b));
        let hasNodeChanges = false;
        allIds.forEach(id => {
            const name1 = nodes1.get(id);
            const name2 = nodes2.get(id);
            if (!name1) {
                console.log(chalk_1.default.green(`  [+] Node ${id}: ${name2} (Added)`));
                nodesHtml += `<tr class="added"><td>${id}</td><td>Added</td><td>${name2}</td></tr>`;
                hasNodeChanges = true;
            }
            else if (!name2) {
                console.log(chalk_1.default.red(`  [-] Node ${id}: ${name1} (Removed)`));
                nodesHtml += `<tr class="removed"><td>${id}</td><td>Removed</td><td>${name1}</td></tr>`;
                hasNodeChanges = true;
            }
            else if (name1 !== name2) {
                console.log(chalk_1.default.yellow(`  [*] Node ${id}: ${name1} -> ${name2} (Renamed/Changed)`));
                nodesHtml += `<tr class="changed"><td>${id}</td><td>Changed</td><td>${name1} &rarr; ${name2}</td></tr>`;
                hasNodeChanges = true;
            }
        });
        if (!hasNodeChanges) {
            console.log(chalk_1.default.gray('  No node changes detected.'));
        }
        // 2. Comparaison des Variables
        console.log(chalk_1.default.bold.blue('\n=== Variables Comparison ==='));
        const vars1 = new Map(meta1.variables.map(v => [v.name, v]));
        const vars2 = new Map(meta2.variables.map(v => [v.name, v]));
        const allVarNames = Array.from(new Set([...vars1.keys(), ...vars2.keys()])).sort();
        let hasVarChanges = false;
        let variablesHtml = `<h3>Variables</h3><table><tr><th>Name</th><th>Status</th><th>Details</th></tr>`;
        allVarNames.forEach(name => {
            const v1 = vars1.get(name);
            const v2 = vars2.get(name);
            if (!v1) {
                console.log(chalk_1.default.green(`  [+] Variable ${name}: ${v2?.value} (Added)`));
                variablesHtml += `<tr class="added"><td>${name}</td><td>Added</td><td>${v2?.value}</td></tr>`;
                hasVarChanges = true;
            }
            else if (!v2) {
                console.log(chalk_1.default.red(`  [-] Variable ${name} (Removed)`));
                variablesHtml += `<tr class="removed"><td>${name}</td><td>Removed</td><td>${v1.value}</td></tr>`;
                hasVarChanges = true;
            }
            else if (v1.value !== v2.value || v1.type !== v2.type) {
                console.log(chalk_1.default.yellow(`  [*] Variable ${name}: ${v1.value} -> ${v2.value} (${v1.type} -> ${v2.type})`));
                variablesHtml += `<tr class="changed"><td>${name}</td><td>Changed</td><td>${v1.value} &rarr; ${v2.value} (${v1.type} &rarr; ${v2.type})</td></tr>`;
                hasVarChanges = true;
            }
        });
        if (!hasVarChanges) {
            console.log(chalk_1.default.gray('  No variable changes detected.'));
        }
        if (options.html) {
            nodesHtml += `</table>`;
            variablesHtml += `</table>`;
            htmlReport += nodesHtml + variablesHtml + `</body></html>`;
            const fs = require('fs');
            fs.writeFileSync(options.html, htmlReport, 'utf8');
            console.log(chalk_1.default.green(`\n✅ Rapport HTML généré : ${options.html}`));
        }
        console.log('');
    }
    catch (err) {
        console.error(chalk_1.default.red(`❌ Error during diff: ${err.message}`));
        process.exit(1);
    }
});
//# sourceMappingURL=diff.js.map