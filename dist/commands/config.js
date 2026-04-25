"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const cli_table3_1 = __importDefault(require("cli-table3"));
const config_1 = __importDefault(require("../utils/config"));
exports.configCommand = new commander_1.Command('config')
    .description('Gère la configuration globale du CLI');
exports.configCommand
    .command('set <key> <value>')
    .description('Définit une valeur de configuration (ex: local.knimePath)')
    .action((key, value) => {
    try {
        config_1.default.set(key, value);
        console.log(chalk_1.default.green(`✅ ${key} défini sur : ${value}`));
    }
    catch (err) {
        console.error(chalk_1.default.red(`❌ Erreur : ${err.message}`));
    }
});
exports.configCommand
    .command('get <key>')
    .description('Affiche une valeur de configuration')
    .action((key) => {
    const value = config_1.default.get(key);
    if (value !== undefined) {
        console.log(`${key}: ${chalk_1.default.cyan(JSON.stringify(value, null, 2))}`);
    }
    else {
        console.log(chalk_1.default.yellow(`⚠️  ${key} n'est pas défini.`));
    }
});
exports.configCommand
    .command('list')
    .description('Liste toute la configuration')
    .action(() => {
    const table = new cli_table3_1.default({
        head: [chalk_1.default.blue('Clé'), chalk_1.default.blue('Valeur')]
    });
    const store = config_1.default.store;
    const flatten = (obj, prefix = '') => {
        let entries = [];
        for (const [key, value] of Object.entries(obj)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                entries = entries.concat(flatten(value, fullKey));
            }
            else {
                entries.push([fullKey, JSON.stringify(value)]);
            }
        }
        return entries;
    };
    flatten(store).forEach(([k, v]) => {
        table.push([chalk_1.default.cyan(k), v]);
    });
    console.log(chalk_1.default.bold('\n=== Configuration Globale ==='));
    console.log(table.toString());
    console.log('');
});
exports.configCommand
    .command('delete <key>')
    .description('Supprime une clé de configuration')
    .action((key) => {
    config_1.default.delete(key);
    console.log(chalk_1.default.yellow(`🗑️  ${key} supprimé.`));
});
//# sourceMappingURL=config.js.map