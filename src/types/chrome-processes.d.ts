/**
 * Type definitions for Chrome's processes API
 * Reference: https://developer.chrome.com/docs/extensions/reference/processes/
 */

declare namespace chrome {
  export namespace processes {
    export interface Process {
      id: number;
      osProcessId: number;
      title: string;
      type: string;
      cpu: number; // CPU usage
      network: number; // Network usage
      privateMemory: number; // Private memory usage in KB
      jsMemoryAllocated?: number;
      jsMemoryUsed?: number;
      tasks: Task[];
      profile?: string;
    }

    export interface Task {
      title: string;
      tabId?: number;
      type?: string;
    }

    export interface GetProcessInfoOptions {
      maxProcessCount?: number;
    }

    export function getProcessInfo(
      options: GetProcessInfoOptions,
      callback: (processes: Record<string, Process>) => void
    ): void;

    export function terminate(processId: number, callback?: () => void): void;
  }
}
