import { Command } from 'commander';
import { listCommand } from './commands/list';
import { runCommand } from './commands/run';
import { statusCommand } from './commands/status';
import { stopCommand } from './commands/stop';
import { infoCommand } from './commands/info';
import { validateCommand } from './commands/validate';
import { configCommand } from './commands/config';
import { docCommand } from './commands/doc';
import { liveCommand } from './commands/live';
import { diffCommand } from './commands/diff';
import { reportCommand } from './commands/report';
import { installSkillCommand } from './commands/install-skill';
import { lineageCommand } from './commands/lineage';
import { createCommand } from './commands/create';
import { addNodeCommand } from './commands/add-node';
import { connectCommand } from './commands/connect';
import { buildCommand } from './commands/build';


const program = new Command();

program
  .name('knime')
  .description('CLI pour la gestion de workflows KNIME')
  .version('1.1.0');

// Force UTF-8 encoding for Windows compatibility
if (process.stdout.isTTY) {
  process.stdout.setDefaultEncoding?.('utf8');
}

program.addCommand(listCommand);
program.addCommand(runCommand);
program.addCommand(statusCommand);
program.addCommand(stopCommand);
program.addCommand(infoCommand);
program.addCommand(validateCommand);
program.addCommand(configCommand);
program.addCommand(docCommand);
program.addCommand(liveCommand);
program.addCommand(diffCommand);
program.addCommand(reportCommand);
program.addCommand(installSkillCommand);
program.addCommand(lineageCommand);
program.addCommand(createCommand);
program.addCommand(addNodeCommand);
program.addCommand(connectCommand);
program.addCommand(buildCommand);


program.parse(process.argv);