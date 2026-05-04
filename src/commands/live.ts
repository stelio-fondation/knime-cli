import { Command } from 'commander';
import chalk from 'chalk';
import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { parseWorkflowMetadata } from '../utils/knime-parser';

export const liveCommand = new Command('live')
  .description('Démarre le serveur de pilotage live pour modifier le workflow en temps réel')
  .requiredOption('-w, --workflow <name>', 'Workflow à piloter')
  .option('-p, --path <path>', 'Chemin du workflow', '.')
  .option('--port <port>', 'Port du serveur', '3030')
  .action((options: any) => {
    const app = express();
    app.use(express.json());

    const workflowPath = path.join(options.path, options.workflow, 'workflow.knime');

    if (!fs.existsSync(workflowPath)) {
      console.error(chalk.red(`❌ Workflow introuvable : ${workflowPath}`));
      process.exit(1);
    }

    const server = app.listen(options.port, () => {
      console.log(chalk.blue.bold('\n🚀 KNIME Live Pilot démarré !'));
      console.log(chalk.gray(`Workflow : ${workflowPath}`));
      console.log(chalk.green(`URL      : http://localhost:${options.port}`));
      console.log(chalk.yellow('\nEn attente de commandes de pilotage...'));
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.error(chalk.red(`❌ Le port ${options.port} est déjà utilisé. Essayez un autre port avec --port <port>.`));
      } else {
        console.error(chalk.red(`❌ Erreur lors du démarrage du serveur : ${err.message}`));
      }
      process.exit(1);
    });

    // GET / : Dashboard Web
    app.get('/', (req, res) => {
      // On cherche d'abord dans dist (prod) puis dans src (dev)
      const possiblePaths = [
        path.join(__dirname, '../resources/dashboard.html'),
        path.join(__dirname, '../../src/resources/dashboard.html'),
        path.join(process.cwd(), 'src/resources/dashboard.html')
      ];
      
      const dashPath = possiblePaths.find(p => fs.existsSync(p));
      
      if (dashPath) {
        res.sendFile(dashPath);
      } else {
        res.status(404).send('Dashboard template not found. Please ensure src/resources/dashboard.html exists.');
      }
    });

    // GET /nodes : Liste les nœuds
    app.get('/nodes', (req, res) => {
      try {
        const xmlData = fs.readFileSync(workflowPath, 'utf8');
        const metadata = parseWorkflowMetadata(xmlData, options.workflow);
        res.json(metadata.nodes);
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });

    // GET /variables : Liste les variables
    app.get('/variables', (req, res) => {
      try {
        const xmlData = fs.readFileSync(workflowPath, 'utf8');
        const metadata = parseWorkflowMetadata(xmlData, options.workflow);
        res.json(metadata.variables);
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });

    // POST /pilot : Actions de modification
    app.post('/pilot', (req: express.Request, res: express.Response) => {
      const { action, data } = req.body;
      
      try {
        if (action === 'add_annotation') {
          addAnnotation(workflowPath, data.text, data.x, data.y);
          console.log(chalk.green(`✅ Annotation ajoutée : "${data.text.substring(0, 20)}..."`));
          return res.json({ status: 'ok', message: 'Annotation ajoutée' });
        }

        if (action === 'update_variable') {
          updateVariable(workflowPath, data.name, data.value);
          console.log(chalk.green(`✅ Variable mise à jour : ${data.name} = ${data.value}`));
          return res.json({ status: 'ok', message: 'Variable mise à jour' });
        }

        res.status(400).json({ status: 'error', message: 'Action inconnue' });
      } catch (err: any) {
        console.error(chalk.red(`❌ Erreur pilotage : ${err.message}`));
        res.status(500).json({ status: 'error', message: err.message });
      }
    });

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

/**
 * Met à jour ou ajoute une variable de workflow
 */
function updateVariable(filePath: string, name: string, value: string) {
  const xmlData = fs.readFileSync(filePath, 'utf8');
  const parser = new XMLParser({ ignoreAttributes: false });
  const builder = new XMLBuilder({ ignoreAttributes: false, format: true });

  const jsonObj = parser.parse(xmlData);
  if (!jsonObj.config) jsonObj.config = { config: [] };

  let configs = Array.isArray(jsonObj.config.config) ? jsonObj.config.config : [jsonObj.config.config];
  let variablesConfig = configs.find((c: any) => c['@_key'] === 'workflow_variables');

  if (!variablesConfig) {
    variablesConfig = { '@_key': 'workflow_variables', config: [] };
    if (!Array.isArray(jsonObj.config.config)) jsonObj.config.config = [];
    jsonObj.config.config.push(variablesConfig);
  }

  const varList = Array.isArray(variablesConfig.config) ? variablesConfig.config : (variablesConfig.config ? [variablesConfig.config] : []);
  
  // Chercher si la variable existe déjà
  let existingVar = varList.find((v: any) => {
    const entries = Array.isArray(v.entry) ? v.entry : [v.entry];
    return entries.find((e: any) => e['@_key'] === 'name' && e['@_value'] === name);
  });

  if (existingVar) {
    const entries = Array.isArray(existingVar.entry) ? existingVar.entry : [existingVar.entry];
    const valueEntry = entries.find((e: any) => e['@_key'] === 'value');
    if (valueEntry) valueEntry['@_value'] = value;
  } else {
    const nextId = varList.length;
    const newVar = {
      '@_key': `variable_${nextId}`,
      entry: [
        { '@_key': 'name', '@_type': 'xstring', '@_value': name },
        { '@_key': 'class', '@_type': 'xstring', '@_value': 'java.lang.String' },
        { '@_key': 'value', '@_type': 'xstring', '@_value': value }
      ]
    };
    if (!Array.isArray(variablesConfig.config)) variablesConfig.config = [];
    variablesConfig.config.push(newVar);
  }

  const newXml = builder.build(jsonObj);
  fs.writeFileSync(filePath, '<?xml version="1.0" encoding="UTF-8"?>\n' + newXml, { encoding: 'utf8' });
}
