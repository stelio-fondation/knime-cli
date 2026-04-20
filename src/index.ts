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

const program = new Command();

program
  .name('knime')
  .description('CLI pour la gestion de workflows KNIME')
  .version('1.0.0');

program.addCommand(listCommand);
program.addCommand(runCommand);
program.addCommand(statusCommand);
program.addCommand(stopCommand);
program.addCommand(infoCommand);
program.addCommand(validateCommand);
program.addCommand(configCommand);
program.addCommand(docCommand);
program.addCommand(liveCommand);

program.parse(process.argv);