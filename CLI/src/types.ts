// SpecTree CLI Types (F3.1.4)

export interface CliConfig {
  apiKey: string;
  apiUrl: string;
  defaultFormat: OutputFormat;
  projectName: string;
  outputDir: string;
}

export type OutputFormat = 'json' | 'yaml' | 'markdown' | 'csv';

export interface SpecNode {
  id: string;
  title: string;
  type: 'epic' | 'feature' | 'user-story' | 'task';
  description: string;
  parentId?: string;
  children: string[];
  metadata: Record<string, unknown>;
}

export type SyncDirection = 'push' | 'pull' | 'both';

export interface SyncResult {
  direction: SyncDirection;
  created: number;
  updated: number;
  deleted: number;
  conflicts: SyncConflict[];
}

export interface SyncConflict {
  nodeId: string;
  localVersion: SpecNode;
  remoteVersion: SpecNode;
  resolution: 'local' | 'remote' | 'skip' | null;
}

export interface WatchEvent {
  type: 'create' | 'update' | 'delete';
  path: string;
  timestamp: Date;
}

export interface ExportOptions {
  format: OutputFormat;
  outputPath?: string;
  includeMetadata: boolean;
  prettyPrint: boolean;
}

export interface ApiResponse<T> {
  data: T;
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export class CliError extends Error {
  code: string;
  statusCode?: number;

  constructor(message: string, code: string, statusCode?: number) {
    super(message);
    this.name = 'CliError';
    this.code = code;
    this.statusCode = statusCode;

    // Restore prototype chain (necessary when extending built-ins in TS)
    Object.setPrototypeOf(this, CliError.prototype);
  }
}
