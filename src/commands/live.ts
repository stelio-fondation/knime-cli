import { Command } from 'commander';
import chalk from 'chalk';
import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

export const liveCommand = new Command('live')
  .description('Démarre le serveur de pilotage live pour modifier le workflow en temps réel')
  .requiredOption('-w, --workflow <name>', 'Workflow à piloter')
  .option('-p, --path <path>', 'Chemin du workflow', '.')
  .option('--port <port>', 'Port du serveur', '3000')
  .action((options: any) => {
    const app = express();
    app.use(express.json());

    const workflowPath = path.join(options.path, options.workflow, 'workflow.knime');

    if (!fs.existsSync(workflowPath)) {
      console.error(chalk.red(`❌ Workflow introuvable : ${workflowPath}`));
      process.exit(1);
    }

    console.log(chalk.blue.bold('\n🚀 KNIME Live Pilot démarré !'));
    console.log(chalk.gray(`Workflow : ${workflowPath}`));
    console.log(chalk.gray(`Port : ${options.port}`));
    console.log(chalk.yellow('\nEn attente de commandes de pilotage...'));

    // Endpoint pour recevoir des commandes de pilotage
    app.post('/pilot', (req: express.Request, res: express.Response) => {
      const { action, data } = req.body;
      
      try {
        if (action === 'add_annotation') {
          addAnnotation(workflowPath, data.text, data.x, data.y);
          console.log(chalk.green(`✅ Annotation ajoutée : "${data.text.substring(0, 20)}..."`));
          return res.json({ status: 'ok', message: 'Annotation ajoutée' });
        }

        res.status(400).json({ status: 'error', message: 'Action inconnue' });
      } catch (err: any) {
        console.error(chalk.red(`❌ Erreur pilotage : ${err.message}`));
        res.status(500).json({ status: 'error', message: err.message });
      }
    });

    app.listen(options.port);
  });

/**
 * Logique de manipulation XML pour ajouter une annotation
 */
function addAnnotation(filePath: string, text: string, x: number = 0, y: number = 0) {
  const xmlData = fs.readFileSync(filePath, 'utf8');
  const parser = new XMLParser({ ignoreAttributes: false });
  const builder = new XMLBuilder({ ignoreAttributes: false, format: true });

  const jsonObj = parser.parse(xmlData);
  
  if (!jsonObj.config) jsonObj.config = { config: [] };
  
  let configs = Array.isArray(jsonObj.config.config) ? jsonObj.config.config : [jsonObj.config.config];
  let annotationsConfig = configs.find((c: any) => c['@_key'] === 'annotations');

  if (!annotationsConfig) {
    annotationsConfig = { '@_key': 'annotations', config: [] };
    if (!Array.isArray(jsonObj.config.config)) jsonObj.config.config = [];
    jsonObj.config.config.push(annotationsConfig);
  }

  const existingAnnotations = Array.isArray(annotationsConfig.config) ? annotationsConfig.config : (annotationsConfig.config ? [annotationsConfig.config] : []);
  const nextId = existingAnnotations.length;

  const newAnnotation = {
    '@_key': `annotation_${nextId}`,
    entry: [
      { '@_key': 'text', '@_type': 'xstring', '@_value': text },
      { '@_key': 'bgcolor', '@_type': 'xint', '@_value': '16777215' },
      { '@_key': 'x-coordinate', '@_type': 'xint', '@_value': x.toString() },
      { '@_key': 'y-coordinate', '@_type': 'xint', '@_value': y.toString() },
      { '@_key': 'width', '@_type': 'xint', '@_value': '200' },
      { '@_key': 'height', '@_type': 'xint', '@_value': '100' }
    ]
  };

  if (!Array.isArray(annotationsConfig.config)) annotationsConfig.config = [];
  annotationsConfig.config.push(newAnnotation);

  const newXml = builder.build(jsonObj);
  fs.writeFileSync(filePath, '<?xml version="1.0" encoding="UTF-8"?>\n' + newXml, { encoding: 'utf8' });
}
