import * as fs from 'fs';
import * as path from 'path';

export interface Execution {
  id: string;
  pid: number;
  workflow: string;
  startTime: string;
  status: 'running' | 'completed' | 'failed' | 'stopped';
}

const REGISTRY_DIR = '.knime-cli';
const REGISTRY_FILE = path.join(REGISTRY_DIR, 'executions.json');

function ensureRegistry() {
  if (!fs.existsSync(REGISTRY_DIR)) {
    fs.mkdirSync(REGISTRY_DIR, { recursive: true });
  }
  if (!fs.existsSync(REGISTRY_FILE)) {
    fs.writeFileSync(REGISTRY_FILE, JSON.stringify({ executions: [] }, null, 2));
  }
}

export function getExecutions(): Execution[] {
  ensureRegistry();
  try {
    const data = fs.readFileSync(REGISTRY_FILE, 'utf8');
    return JSON.parse(data).executions;
  } catch (err) {
    return [];
  }
}

export function saveExecutions(executions: Execution[]) {
  ensureRegistry();
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify({ executions }, null, 2));
}

export function addExecution(execution: Execution) {
  const executions = getExecutions();
  executions.push(execution);
  saveExecutions(executions);
}

export function updateExecutionStatus(pid: number, status: Execution['status']) {
  const executions = getExecutions();
  const index = executions.findIndex(e => e.pid === pid);
  if (index !== -1) {
    executions[index].status = status;
    saveExecutions(executions);
  }
}

export function removeExecution(pid: number) {
  const executions = getExecutions();
  const filtered = executions.filter(e => e.pid !== pid);
  saveExecutions(filtered);
}
