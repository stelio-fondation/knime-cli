"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
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
    console.log(chalk_1.default.bold('\n=== Configuration Globale ==='));
    console.log(JSON.stringify(config_1.default.store, null, 2));
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