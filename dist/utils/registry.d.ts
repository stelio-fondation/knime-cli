export interface Execution {
    id: string;
    pid: number;
    workflow: string;
    startTime: string;
    status: 'running' | 'completed' | 'failed' | 'stopped';
}
export declare function getExecutions(): Execution[];
export declare function saveExecutions(executions: Execution[]): void;
export declare function addExecution(execution: Execution): void;
export declare function updateExecutionStatus(pid: number, status: Execution['status']): void;
export declare function removeExecution(pid: number): void;
//# sourceMappingURL=registry.d.ts.map