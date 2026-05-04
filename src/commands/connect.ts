import { Command } from 'commander';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  parseAttributeValue: true
});

const builder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  format: true,
  indentBy: "    "
});

export const connectCommand = new Command('connect')
  .description('Connecte deux nœuds dans un workflow')
  .requiredOption('-w, --workflow <name>', 'Nom du workflow')
  .requiredOption('--from <nodeId:port>', 'Nœud source et port (ex: 1:1)')
  .requiredOption('--to <nodeId:port>', 'Nœud destination et port (ex: 2:1)')
  .option('-p, --path <path>', 'Répertoire des workflows', '.')
  .action((options) => {
    try {
      const wfPath = path.join(options.path, options.workflow);
      const workflowFile = path.join(wfPath, 'workflow.knime');

      if (!fs.existsSync(workflowFile)) {
        console.error(chalk.red(`❌ Workflow ${options.workflow} non trouvé.`));
        process.exit(1);
      }

      const [sourceID, sourcePort] = options.from.split(':').map(Number);
      const [destID, destPort] = options.to.split(':').map(Number);

      if (isNaN(sourceID) || isNaN(sourcePort) || isNaN(destID) || isNaN(destPort)) {
        throw new Error('Format invalide pour --from ou --to (attendu nodeId:port)');
      }

      const xml = fs.readFileSync(workflowFile, 'utf8');
      const jsonObj = parser.parse(xml);

      if (!jsonObj.config.config) jsonObj.config.config = [];
      let connectionsConfig = jsonObj.config.config.find((c: any) => c['@_key'] === 'connections');
      
      if (!connectionsConfig) {
         connectionsConfig = { '@_key': 'connections', config: [] };
         jsonObj.config.config.push(connectionsConfig);
      }
      
      if (!connectionsConfig.config) connectionsConfig.config = [];
      if (!Array.isArray(connectionsConfig.config)) {
          connectionsConfig.config = [connectionsConfig.config];
      }

      const connId = connectionsConfig.config.length;

      connectionsConfig.config.push({
        '@_key': `connection_${connId}`,
        'entry': [
          { '@_key': 'sourceID', '@_type': 'xint', '@_value': sourceID },
          { '@_key': 'destID', '@_type': 'xint', '@_value': destID },
          { '@_key': 'sourcePort', '@_type': 'xint', '@_value': sourcePort },
          { '@_key': 'destPort', '@_type': 'xint', '@_value': destPort }
        ]
      });

      fs.writeFileSync(workflowFile, builder.build(jsonObj));

      console.log(chalk.green(`✅ Connexion établie : ${sourceID}:${sourcePort} -> ${destID}:${destPort}`));
    } catch (err: any) {
      console.error(chalk.red(`❌ Erreur lors de la connexion : ${err.message}`));
      process.exit(1);
    }
  });
