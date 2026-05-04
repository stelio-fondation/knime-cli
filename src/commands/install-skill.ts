import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import chalk from 'chalk';

export const installSkillCommand = new Command('install-skill')
  .description('Déploie knime-cli en tant que skill dans les environnements globaux des agents IA (Antigravity, Claude Code, Opencode, Hermes)')
  .option('--dry-run', 'Affiche les chemins sans copier les fichiers')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🔍 Recherche des environnements d\'agents IA...'));
      
      const home = os.homedir();
      // Répertoires racines où les agents stockent généralement leurs skills
      const skillTargets = [
        { name: 'Antigravity / Gemini', path: path.join(home, '.gemini', 'antigravity', 'skills') },
        { name: 'Claude Code', path: path.join(home, '.claudecode', 'skills') },
        { name: 'Opencode', path: path.join(home, '.opencode', 'skills') },
        { name: 'Hermes', path: path.join(home, '.hermes', 'skills') },
      ];

      // Localisation de SKILL.md dans le package npm (../.. car ce fichier sera dans dist/commands/)
      const skillSourcePath = path.join(__dirname, '..', '..', 'SKILL.md');
      
      if (!fs.existsSync(skillSourcePath)) {
        console.error(chalk.red(`❌ Impossible de trouver le fichier SKILL.md à l'emplacement : ${skillSourcePath}`));
        process.exit(1);
      }

      let installedCount = 0;

      for (const target of skillTargets) {
        if (fs.existsSync(target.path)) {
          const destDir = path.join(target.path, 'knime-cli');
          const destFile = path.join(destDir, 'SKILL.md');

          console.log(chalk.yellow(`\nAgent détecté : ${target.name}`));
          console.log(chalk.gray(`-> Cible : ${destDir}`));

          if (options.dryRun) {
            console.log(chalk.green(`[DRY-RUN] Copierait ${skillSourcePath} vers ${destFile}`));
            installedCount++;
          } else {
            if (!fs.existsSync(destDir)) {
              fs.mkdirSync(destDir, { recursive: true });
            }
            fs.copyFileSync(skillSourcePath, destFile);
            console.log(chalk.green(`✅ Skill déployée avec succès pour ${target.name}`));
            installedCount++;
          }
        }
      }

      if (installedCount === 0) {
        console.log(chalk.yellow('\n⚠️ Aucun répertoire de skill d\'agent IA connu n\'a été détecté sur cette machine.'));
      } else {
        console.log(chalk.cyan(`\n🎉 Opération terminée ! (${installedCount} agent(s) mis à jour)`));
      }

    } catch (error: any) {
      console.error(chalk.red(`❌ Erreur lors du déploiement : ${error.message}`));
      process.exit(1);
    }
  });
