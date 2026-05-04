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

const FACTORY_MAP: Record<string, string> = {
  'CSV Reader': 'org.knime.base.node.io.filehandling.csv.reader.CSVTableReaderNodeFactory',
  'Excel Reader': 'org.knime.ext.poi3.node.io.excel.reader.ExcelReaderNodeFactory3',
  'CSV Writer': 'org.knime.base.node.io.filehandling.csv.writer.CSVTableWriterNodeFactory',
  'Excel Writer': 'org.knime.ext.poi3.node.io.excel.writer.ExcelWriterNodeFactory3',
  'GroupBy': 'org.knime.base.node.preproc.groupby.GroupByNodeFactory',
  'Joiner': 'org.knime.base.node.preproc.joiner3.Joiner3NodeFactory',
  'Row Filter': 'org.knime.base.node.preproc.filter.row.RowFilterNodeFactory',
  'Column Filter': 'org.knime.base.node.preproc.filter.column.DataColumnSpecFilterNodeFactory',
  'Table Creator': 'org.knime.base.node.io.tablecreator.TableCreator2NodeFactory'
};

export const addNodeCommand = new Command('add-node')
  .description('Ajoute un nœud à un workflow')
  .requiredOption('-w, --workflow <name>', 'Nom du workflow')
  .requiredOption('-t, --type <type>', 'Type de nœud (ex: "CSV Reader")')
  .option('-i, --id <id>', 'ID du nœud (numérique)')
  .option('-p, --path <path>', 'Répertoire des workflows', '.')
  .action((options) => {
    try {
      const wfPath = path.join(options.path, options.workflow);
      const workflowFile = path.join(wfPath, 'workflow.knime');

      if (!fs.existsSync(workflowFile)) {
        console.error(chalk.red(`❌ Workflow ${options.workflow} non trouvé dans ${options.path}`));
        process.exit(1);
      }

      const nodeId = parseInt(options.id) || findNextNodeId(wfPath);
      const nodeName = `${options.type} (#${nodeId})`;
      const nodeDir = path.join(wfPath, nodeName);

      // 1. Create node directory
      if (!fs.existsSync(nodeDir)) {
        fs.mkdirSync(nodeDir, { recursive: true });
      }

      // 2. Create settings.xml for node
      const templatePath = path.resolve(__dirname, '../resources/templates/nodes/generic/settings.xml');
      const devTemplatePath = path.resolve(__dirname, '../../src/resources/templates/nodes/generic/settings.xml');
      
      const actualTemplatePath = fs.existsSync(templatePath) ? templatePath : devTemplatePath;
      
      if (!fs.existsSync(actualTemplatePath)) {
        throw new Error(`Template settings.xml non trouvé.`);
      }

      let settingsContent = fs.readFileSync(actualTemplatePath, 'utf8');
      settingsContent = settingsContent.replace('{{NODE_NAME}}', options.type)
                                       .replace('{{FACTORY}}', FACTORY_MAP[options.type] || options.type);
      fs.writeFileSync(path.join(nodeDir, 'settings.xml'), settingsContent);

      // 3. Update workflow.knime
      const xml = fs.readFileSync(workflowFile, 'utf8');
      const jsonObj = parser.parse(xml);

      if (!jsonObj.config.config) jsonObj.config.config = [];
      let nodesConfig = jsonObj.config.config.find((c: any) => c['@_key'] === 'nodes');
      
      if (!nodesConfig) {
         nodesConfig = { '@_key': 'nodes', config: [] };
         jsonObj.config.config.push(nodesConfig);
      }
      
      if (!nodesConfig.config) nodesConfig.config = [];
      if (!Array.isArray(nodesConfig.config)) {
          // If it was a single object, convert to array
          nodesConfig.config = [nodesConfig.config];
      }

      nodesConfig.config.push({
        '@_key': `node_${nodeId}`,
        'entry': [
          { '@_key': 'id', '@_type': 'xint', '@_value': nodeId },
          { '@_key': 'node_settings_file', '@_type': 'xstring', '@_value': `${nodeName}/settings.xml` },
          { '@_key': 'node_is_meta', '@_type': 'xboolean', '@_value': false },
          { '@_key': 'node_type', '@_type': 'xstring', '@_value': 'NativeNode' },
          { '@_key': 'ui_classname', '@_type': 'xstring', '@_value': 'org.knime.core.node.workflow.NodeUIInformation' }
        ],
        'config': {
          '@_key': 'ui_settings',
          'config': {
            '@_key': 'extrainfo.node.bounds',
            'entry': [
               { '@_key': 'array-size', '@_type': 'xint', '@_value': 4 },
               { '@_key': '0', '@_type': 'xint', '@_value': 150 * nodeId },
               { '@_key': '1', '@_type': 'xint', '@_value': 150 },
               { '@_key': '2', '@_type': 'xint', '@_value': -1 },
               { '@_key': '3', '@_type': 'xint', '@_value': -1 }
            ]
          }
        }
      });

      fs.writeFileSync(workflowFile, builder.build(jsonObj));

      console.log(chalk.green(`✅ Nœud ${nodeName} ajouté au workflow.`));
    } catch (err: any) {
      console.error(chalk.red(`❌ Erreur lors de l'ajout du nœud : ${err.message}`));
      process.exit(1);
    }
  });

function findNextNodeId(wfPath: string): number {
  const files = fs.readdirSync(wfPath);
  let maxId = 0;
  files.forEach(f => {
    const match = f.match(/\(#(\d+)\)/);
    if (match) {
      const id = parseInt(match[1]);
      if (id > maxId) maxId = id;
    }
  });
  return maxId + 1;
}
