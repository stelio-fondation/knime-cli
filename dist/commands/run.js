"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCommand = void 0;
const commander_1 = require("commander");
const server_api_1 = require("../utils/server-api");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const config_1 = __importDefault(require("../utils/config"));
const workflow_1 = require("../utils/workflow");
const registry_1 = require("../utils/registry");
function findKnimeBatch(knimePath) {
    if (knimePath) {
        const possiblePaths = [
            path.join(knimePath, 'knime'),
            path.join(knimePath, 'knime.exe'),
            path.join(knimePath, 'knime.bat'),
        ];
        for (const p of possiblePaths) {
            if (fs.existsSync(p))
                return p;
        }
        return null;
    }
    const possiblePaths = [
        'C:\\Program Files\\KNIME\\knime.exe',
        'C:\\Program Files (x86)\\KNIME\\knime.exe',
        '/usr/local/knime/knime',
        '/opt/knime/knime',
    ];
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            return p;
        }
    }
    return null;
}
function parseParams(paramsStr) {
    try {
        return JSON.parse(paramsStr);
    }
    catch {
        console.error('Invalid JSON parameters');
        process.exit(1);
    }
}
exports.runCommand = new commander_1.Command('run')
    .description('Exécute un workflow KNIME')
    .requiredOption('-w, --workflow <name>', 'Nom du workflow')
    .option('-p, --path <path>', 'Chemin du dossier contenant le workflow', '.')
    .option('-s, --server', 'Exécuter sur le KNIME Server')
    .option('--params <json>', 'Paramètres au format JSON', '{}')
    .option('-k, --knime-path <path>', 'Chemin vers KNIME')
    .option('-v, --verbose', 'Afficher la sortie KNIME')
    .option('--save', 'Sauvegarder le workflow après exécution')
    .action(async (options) => {
    if (options.server) {
        const spinner = (0, ora_1.default)(`Connecting to KNIME Server...`).start();
        try {
            const client = new server_api_1.KnimeServerClient();
            const params = parseParams(options.params || '{}');
            spinner.text = `Executing ${chalk_1.default.cyan(options.workflow)} on server...`;
            const jobId = await client.executeWorkflow(options.workflow, params);
            spinner.text = `Job created: ${chalk_1.default.green(jobId)}. Polling status...`;
            let finished = false;
            while (!finished) {
                const status = await client.getJobStatus(jobId);
                if (status.status === 'FINISHED') {
                    spinner.succeed(chalk_1.default.green(`Workflow executed successfully on server (Job: ${jobId}).`));
                    finished = true;
                }
                else if (status.status === 'FAILED' || status.status === 'DISCARDED') {
                    spinner.fail(chalk_1.default.red(`Workflow ${status.status.toLowerCase()} on server: ${status.message || 'Check logs on server.'}`));
                    finished = true;
                    process.exit(1);
                }
                else {
                    spinner.text = `Job ${jobId} is ${chalk_1.default.yellow(status.status.toLowerCase())}...`;
                }
                if (!finished) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
        }
        catch (err) {
            let msg = err.message;
            const serverUrl = config_1.default.get('server.url');
            if (err.code === 'ENOTFOUND') {
                msg = `Impossible de joindre le KNIME Server à ${serverUrl}. Vérifiez votre configuration (knime config get server.url).`;
            }
            else if (err.code === 'ECONNREFUSED') {
                msg = `Connexion refusée par le KNIME Server (${serverUrl}). Assurez-vous que le serveur est démarré.`;
            }
            spinner.fail(chalk_1.default.red(`Server Error: ${msg}`));
            process.exit(1);
        }
        return;
    }
    let targetPath = '';
    let workflowArg = '-workflowFile';
    try {
        const target = (0, workflow_1.resolveWorkflowPath)(options.workflow, options.path);
        targetPath = target.targetPath;
        workflowArg = target.workflowArg;
    }
    catch (err) {
        console.error(chalk_1.default.red(`❌ Error: ${err.message}`));
        process.exit(1);
    }
    const knimeBatch = findKnimeBatch(options.knimePath || config_1.default.get('local.knimePath'));
    if (!knimeBatch) {
        console.error(chalk_1.default.red('❌ Error: KNIME not found. Configure it with:'));
        console.log(chalk_1.default.cyan('   knime config set local.knimePath "/path/to/knime"'));
        process.exit(1);
    }
    const params = parseParams(options.params || '{}');
    const spinner = (0, ora_1.default)(`Executing workflow: ${chalk_1.default.cyan(options.workflow)}...`).start();
    if (options.verbose) {
        spinner.stop();
        console.log(chalk_1.default.blue(`\nExecuting: ${targetPath}`));
        console.log(chalk_1.default.blue(`KNIME: ${knimeBatch}\n`));
    }
    const args = [
        '-nosplash',
        '-application', 'org.knime.product.KNIME_BATCH_APPLICATION',
        '-reset',
        workflowArg, targetPath
    ];
    if (!options.save) {
        args.push('-nosave');
    }
    for (const [key, value] of Object.entries(params)) {
        args.push(`-workflow.variable=${key},${value},String`);
    }
    if (!options.verbose) {
        args.push('-consoleLog', 'none');
    }
    const proc = (0, child_process_1.spawn)(knimeBatch, args, {
        stdio: options.verbose ? 'inherit' : 'ignore',
        shell: false
    });
    if (proc.pid) {
        (0, registry_1.addExecution)({
            id: proc.pid.toString(),
            pid: proc.pid,
            workflow: options.workflow,
            startTime: new Date().toISOString(),
            status: 'running'
        });
    }
    proc.on('error', (err) => {
        if (proc.pid)
            (0, registry_1.removeExecution)(proc.pid);
        spinner.fail(chalk_1.default.red(`Error: ${err.message}`));
        process.exit(1);
    });
    proc.on('close', (code) => {
        if (proc.pid)
            (0, registry_1.removeExecution)(proc.pid);
        if (code === 0) {
            spinner.succeed(chalk_1.default.green('Workflow executed successfully.'));
        }
        else {
            spinner.fail(chalk_1.default.red(`Workflow failed with code: ${code}`));
            process.exit(code || 1);
        }
    });
});
//# sourceMappingURL=run.js.map