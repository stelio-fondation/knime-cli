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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExecutions = getExecutions;
exports.saveExecutions = saveExecutions;
exports.addExecution = addExecution;
exports.updateExecutionStatus = updateExecutionStatus;
exports.removeExecution = removeExecution;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
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
function getExecutions() {
    ensureRegistry();
    try {
        const data = fs.readFileSync(REGISTRY_FILE, 'utf8');
        return JSON.parse(data).executions;
    }
    catch (err) {
        return [];
    }
}
function saveExecutions(executions) {
    ensureRegistry();
    fs.writeFileSync(REGISTRY_FILE, JSON.stringify({ executions }, null, 2));
}
function addExecution(execution) {
    const executions = getExecutions();
    executions.push(execution);
    saveExecutions(executions);
}
function updateExecutionStatus(pid, status) {
    const executions = getExecutions();
    const index = executions.findIndex(e => e.pid === pid);
    if (index !== -1) {
        executions[index].status = status;
        saveExecutions(executions);
    }
}
function removeExecution(pid) {
    const executions = getExecutions();
    const filtered = executions.filter(e => e.pid !== pid);
    saveExecutions(filtered);
}
//# sourceMappingURL=registry.js.map