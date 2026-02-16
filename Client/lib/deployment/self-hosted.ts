// Feature F12.4 - Self-Hosted Option
// Deployment configuration, environment validation, health checking, and migration utilities.

// ---------------------------------------------------------------------------
// Types and Interfaces
// ---------------------------------------------------------------------------

export type DeploymentMode = 'cloud' | 'self-hosted' | 'hybrid';

export type DatabaseType = 'postgresql' | 'mysql' | 'sqlite';

export type StorageType = 's3' | 'local' | 'gcs' | 'azure-blob';

export interface DatabaseConfig {
  type: DatabaseType;
  host: string;
  port: number;
  name: string;
  ssl: boolean;
}

export interface StorageConfig {
  type: StorageType;
  bucket?: string;
  region?: string;
  localPath?: string;
}

export interface AuthConfig {
  provider: 'internal' | 'oauth' | 'saml' | 'ldap';
  sessionTimeout: number;
  mfaEnabled: boolean;
}

export interface DeploymentConfig {
  mode: DeploymentMode;
  database: DatabaseConfig;
  storage: StorageConfig;
  auth: AuthConfig;
  domain: string;
  ssl: boolean;
  port: number;
}

export interface EnvironmentCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

export interface MigrationStep {
  version: string;
  description: string;
  up: string;
  down: string;
  appliedAt?: number;
}

export interface SystemRequirements {
  minMemoryMB: number;
  minDiskGB: number;
  minCpuCores: number;
  requiredPorts: number[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const DEFAULT_DB_PORTS: Record<DatabaseType, number> = {
  postgresql: 5432,
  mysql: 3306,
  sqlite: 0,
};

export const SYSTEM_REQUIREMENTS: SystemRequirements = {
  minMemoryMB: 2048,
  minDiskGB: 10,
  minCpuCores: 2,
  requiredPorts: [3000, 5432],
};

export const DEFAULT_SELF_HOSTED_CONFIG: DeploymentConfig = {
  mode: 'self-hosted',
  database: {
    type: 'postgresql',
    host: 'localhost',
    port: DEFAULT_DB_PORTS.postgresql,
    name: 'spectree',
    ssl: false,
  },
  storage: {
    type: 'local',
    localPath: './data/storage',
  },
  auth: {
    provider: 'internal',
    sessionTimeout: 3600,
    mfaEnabled: false,
  },
  domain: 'localhost',
  ssl: false,
  port: 3000,
};

// ---------------------------------------------------------------------------
// Helper utilities
// ---------------------------------------------------------------------------

function isLocalhost(domain: string): boolean {
  return domain === 'localhost' || domain === '127.0.0.1';
}

function deepMerge<T extends Record<string, unknown>>(
  base: T,
  overrides: Partial<T>,
): T {
  const result = { ...base };

  Object.keys(overrides).forEach((key) => {
    const k = key as keyof T;
    const overrideVal = overrides[k];

    if (
      overrideVal !== undefined &&
      typeof overrideVal === 'object' &&
      overrideVal !== null &&
      !Array.isArray(overrideVal) &&
      typeof base[k] === 'object' &&
      base[k] !== null &&
      !Array.isArray(base[k])
    ) {
      result[k] = deepMerge(
        base[k] as Record<string, unknown>,
        overrideVal as Record<string, unknown>,
      ) as T[keyof T];
    } else if (overrideVal !== undefined) {
      result[k] = overrideVal as T[keyof T];
    }
  });

  return result;
}

// ---------------------------------------------------------------------------
// Functions
// ---------------------------------------------------------------------------

/**
 * Creates a deployment configuration by merging optional overrides with the
 * default self-hosted configuration.
 */
export function createDeploymentConfig(
  overrides?: Partial<DeploymentConfig>,
): DeploymentConfig {
  if (!overrides) {
    return { ...DEFAULT_SELF_HOSTED_CONFIG };
  }
  return deepMerge(
    DEFAULT_SELF_HOSTED_CONFIG as unknown as Record<string, unknown>,
    overrides as unknown as Record<string, unknown>,
  ) as unknown as DeploymentConfig;
}

/**
 * Validates a deployment configuration and returns any errors found.
 */
export function validateConfig(
  config: DeploymentConfig,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.domain || config.domain.trim().length === 0) {
    errors.push('Domain must not be empty');
  }

  if (config.port < 1 || config.port > 65535) {
    errors.push('Port must be between 1 and 65535');
  }

  if (!config.database.host || config.database.host.trim().length === 0) {
    errors.push('Database host must not be empty');
  }

  if (!config.ssl && !isLocalhost(config.domain)) {
    errors.push('SSL is recommended for non-localhost deployments');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates domain format. Allows localhost, IPv4 addresses, and valid
 * domain names.
 */
export function validateDomain(domain: string): boolean {
  if (!domain || domain.trim().length === 0) {
    return false;
  }

  const trimmed = domain.trim();

  // Allow localhost
  if (trimmed === 'localhost') {
    return true;
  }

  // Allow IPv4
  const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const ipv4Match = trimmed.match(ipv4Pattern);
  if (ipv4Match) {
    const octets = [ipv4Match[1], ipv4Match[2], ipv4Match[3], ipv4Match[4]];
    return octets.every((octet) => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255;
    });
  }

  // Allow valid domain names
  const domainPattern =
    /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  return domainPattern.test(trimmed);
}

/**
 * Validates the host environment against system requirements, returning a
 * list of checks with pass/fail/warn status.
 */
export function validateEnvironment(
  config: DeploymentConfig,
  system: {
    memoryMB: number;
    diskGB: number;
    cpuCores: number;
    availablePorts: number[];
  },
): EnvironmentCheck[] {
  const checks: EnvironmentCheck[] = [];

  // Memory check
  if (system.memoryMB >= SYSTEM_REQUIREMENTS.minMemoryMB) {
    checks.push({
      name: 'Memory',
      status: 'pass',
      message: `${system.memoryMB}MB available (minimum: ${SYSTEM_REQUIREMENTS.minMemoryMB}MB)`,
    });
  } else {
    checks.push({
      name: 'Memory',
      status: 'fail',
      message: `${system.memoryMB}MB available, but ${SYSTEM_REQUIREMENTS.minMemoryMB}MB required`,
    });
  }

  // Disk check
  if (system.diskGB >= SYSTEM_REQUIREMENTS.minDiskGB) {
    checks.push({
      name: 'Disk Space',
      status: 'pass',
      message: `${system.diskGB}GB available (minimum: ${SYSTEM_REQUIREMENTS.minDiskGB}GB)`,
    });
  } else {
    checks.push({
      name: 'Disk Space',
      status: 'fail',
      message: `${system.diskGB}GB available, but ${SYSTEM_REQUIREMENTS.minDiskGB}GB required`,
    });
  }

  // CPU check
  if (system.cpuCores >= SYSTEM_REQUIREMENTS.minCpuCores) {
    checks.push({
      name: 'CPU Cores',
      status: 'pass',
      message: `${system.cpuCores} cores available (minimum: ${SYSTEM_REQUIREMENTS.minCpuCores})`,
    });
  } else {
    checks.push({
      name: 'CPU Cores',
      status: 'fail',
      message: `${system.cpuCores} cores available, but ${SYSTEM_REQUIREMENTS.minCpuCores} required`,
    });
  }

  // Port availability checks
  const portsToCheck = [...SYSTEM_REQUIREMENTS.requiredPorts, config.port];
  const uniquePorts = Array.from(new Set(portsToCheck));

  uniquePorts.forEach((port) => {
    if (system.availablePorts.includes(port)) {
      checks.push({
        name: `Port ${port}`,
        status: 'pass',
        message: `Port ${port} is available`,
      });
    } else {
      checks.push({
        name: `Port ${port}`,
        status: 'fail',
        message: `Port ${port} is not available`,
      });
    }
  });

  return checks;
}

/**
 * Generates a docker-compose.yml string based on the deployment
 * configuration. Includes the application service, database service, and an
 * optional storage service.
 */
export function generateDockerCompose(config: DeploymentConfig): string {
  const lines: string[] = [];

  lines.push('version: "3.8"');
  lines.push('');
  lines.push('services:');

  // App service
  lines.push('  app:');
  lines.push('    image: spectree/app:latest');
  lines.push('    ports:');
  lines.push(`      - "${config.port}:${config.port}"`);
  lines.push('    environment:');
  lines.push(`      - DATABASE_URL=${buildDatabaseUrl(config.database)}`);
  lines.push(`      - STORAGE_TYPE=${config.storage.type}`);
  lines.push(`      - AUTH_PROVIDER=${config.auth.provider}`);
  lines.push(`      - PORT=${config.port}`);

  if (config.ssl) {
    lines.push('      - SSL_ENABLED=true');
  }

  lines.push('    depends_on:');

  if (config.database.type !== 'sqlite') {
    lines.push('      - db');
  }

  lines.push('    restart: unless-stopped');

  // Database service
  if (config.database.type !== 'sqlite') {
    lines.push('');
    lines.push('  db:');

    if (config.database.type === 'postgresql') {
      lines.push('    image: postgres:16-alpine');
      lines.push('    environment:');
      lines.push('      - POSTGRES_DB=' + config.database.name);
      lines.push('      - POSTGRES_USER=spectree');
      lines.push('      - POSTGRES_PASSWORD=${DB_PASSWORD}');
      lines.push('    ports:');
      lines.push(`      - "${config.database.port}:5432"`);
    } else if (config.database.type === 'mysql') {
      lines.push('    image: mysql:8');
      lines.push('    environment:');
      lines.push('      - MYSQL_DATABASE=' + config.database.name);
      lines.push('      - MYSQL_USER=spectree');
      lines.push('      - MYSQL_PASSWORD=${DB_PASSWORD}');
      lines.push('      - MYSQL_ROOT_PASSWORD=${DB_ROOT_PASSWORD}');
      lines.push('    ports:');
      lines.push(`      - "${config.database.port}:3306"`);
    }

    lines.push('    volumes:');
    lines.push('      - db_data:/var/lib/' + (config.database.type === 'postgresql' ? 'postgresql/data' : 'mysql'));
    lines.push('    restart: unless-stopped');
  }

  // Storage service (only for S3-compatible or cloud storage that needs a local proxy)
  if (config.storage.type === 's3' && config.mode === 'self-hosted') {
    lines.push('');
    lines.push('  minio:');
    lines.push('    image: minio/minio:latest');
    lines.push('    command: server /data --console-address ":9001"');
    lines.push('    ports:');
    lines.push('      - "9000:9000"');
    lines.push('      - "9001:9001"');
    lines.push('    environment:');
    lines.push('      - MINIO_ROOT_USER=${STORAGE_ACCESS_KEY}');
    lines.push('      - MINIO_ROOT_PASSWORD=${STORAGE_SECRET_KEY}');
    lines.push('    volumes:');
    lines.push('      - storage_data:/data');
    lines.push('    restart: unless-stopped');
  }

  // Volumes
  lines.push('');
  lines.push('volumes:');

  if (config.database.type !== 'sqlite') {
    lines.push('  db_data:');
  }

  if (config.storage.type === 's3' && config.mode === 'self-hosted') {
    lines.push('  storage_data:');
  }

  lines.push('');

  return lines.join('\n');
}

/**
 * Generates .env file content from a deployment configuration.
 */
export function generateEnvFile(config: DeploymentConfig): string {
  const lines: string[] = [];

  lines.push('# SpecTree Self-Hosted Environment Configuration');
  lines.push('# Generated by SpecTree deployment tooling');
  lines.push('');

  // Application settings
  lines.push('# Application');
  lines.push(`DEPLOYMENT_MODE=${config.mode}`);
  lines.push(`DOMAIN=${config.domain}`);
  lines.push(`PORT=${config.port}`);
  lines.push(`SSL_ENABLED=${config.ssl}`);
  lines.push('');

  // Database settings
  lines.push('# Database');
  lines.push(`DATABASE_TYPE=${config.database.type}`);
  lines.push(`DATABASE_URL=${buildDatabaseUrl(config.database)}`);

  if (config.database.type !== 'sqlite') {
    lines.push(`DATABASE_HOST=${config.database.host}`);
    lines.push(`DATABASE_PORT=${config.database.port}`);
    lines.push(`DATABASE_NAME=${config.database.name}`);
    lines.push(`DATABASE_SSL=${config.database.ssl}`);
    lines.push('DB_PASSWORD=changeme');
  }

  lines.push('');

  // Storage settings
  lines.push('# Storage');
  lines.push(`STORAGE_TYPE=${config.storage.type}`);

  if (config.storage.bucket) {
    lines.push(`STORAGE_BUCKET=${config.storage.bucket}`);
  }

  if (config.storage.region) {
    lines.push(`STORAGE_REGION=${config.storage.region}`);
  }

  if (config.storage.localPath) {
    lines.push(`STORAGE_LOCAL_PATH=${config.storage.localPath}`);
  }

  if (config.storage.type === 's3' || config.storage.type === 'gcs' || config.storage.type === 'azure-blob') {
    lines.push('STORAGE_ACCESS_KEY=changeme');
    lines.push('STORAGE_SECRET_KEY=changeme');
  }

  lines.push('');

  // Auth settings
  lines.push('# Authentication');
  lines.push(`AUTH_PROVIDER=${config.auth.provider}`);
  lines.push(`SESSION_TIMEOUT=${config.auth.sessionTimeout}`);
  lines.push(`MFA_ENABLED=${config.auth.mfaEnabled}`);
  lines.push('');

  return lines.join('\n');
}

/**
 * Creates a new migration step object.
 */
export function createMigrationStep(
  version: string,
  description: string,
  up: string,
  down: string,
): MigrationStep {
  return { version, description, up, down };
}

/**
 * Returns the list of available migrations that have not yet been applied.
 * Comparison is done by version string.
 */
export function getMigrationPlan(
  applied: MigrationStep[],
  available: MigrationStep[],
): MigrationStep[] {
  const appliedVersions = new Set(applied.map((m) => m.version));
  return available.filter((m) => !appliedVersions.has(m.version));
}

/**
 * Generates an nginx reverse proxy configuration. Includes SSL termination
 * when SSL is enabled in the deployment config.
 */
export function generateNginxConfig(config: DeploymentConfig): string {
  const lines: string[] = [];

  if (config.ssl) {
    // HTTP to HTTPS redirect
    lines.push('server {');
    lines.push('    listen 80;');
    lines.push(`    server_name ${config.domain};`);
    lines.push('');
    lines.push('    location / {');
    lines.push('        return 301 https://$host$request_uri;');
    lines.push('    }');
    lines.push('}');
    lines.push('');

    // HTTPS server
    lines.push('server {');
    lines.push('    listen 443 ssl http2;');
    lines.push(`    server_name ${config.domain};`);
    lines.push('');
    lines.push(`    ssl_certificate /etc/nginx/ssl/${config.domain}.crt;`);
    lines.push(`    ssl_certificate_key /etc/nginx/ssl/${config.domain}.key;`);
    lines.push('    ssl_protocols TLSv1.2 TLSv1.3;');
    lines.push('    ssl_ciphers HIGH:!aNULL:!MD5;');
    lines.push('    ssl_prefer_server_ciphers on;');
    lines.push('');
    lines.push('    location / {');
    lines.push(`        proxy_pass http://127.0.0.1:${config.port};`);
    lines.push('        proxy_set_header Host $host;');
    lines.push('        proxy_set_header X-Real-IP $remote_addr;');
    lines.push('        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;');
    lines.push('        proxy_set_header X-Forwarded-Proto $scheme;');
    lines.push('        proxy_http_version 1.1;');
    lines.push('        proxy_set_header Upgrade $http_upgrade;');
    lines.push('        proxy_set_header Connection "upgrade";');
    lines.push('    }');
    lines.push('}');
  } else {
    // HTTP only
    lines.push('server {');
    lines.push('    listen 80;');
    lines.push(`    server_name ${config.domain};`);
    lines.push('');
    lines.push('    location / {');
    lines.push(`        proxy_pass http://127.0.0.1:${config.port};`);
    lines.push('        proxy_set_header Host $host;');
    lines.push('        proxy_set_header X-Real-IP $remote_addr;');
    lines.push('        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;');
    lines.push('        proxy_set_header X-Forwarded-Proto $scheme;');
    lines.push('        proxy_http_version 1.1;');
    lines.push('        proxy_set_header Upgrade $http_upgrade;');
    lines.push('        proxy_set_header Connection "upgrade";');
    lines.push('    }');
    lines.push('}');
  }

  lines.push('');

  return lines.join('\n');
}

/**
 * Estimates the system resources needed for a given number of users.
 * Uses a linear scaling model with a base allocation.
 */
export function estimateResources(
  userCount: number,
): { memoryMB: number; diskGB: number; cpuCores: number } {
  const memoryMB = 512 + 10 * userCount;
  const diskGB = 5 + 0.1 * userCount;
  const cpuCores = 1 + Math.ceil(userCount / 500);

  return { memoryMB, diskGB, cpuCores };
}

/**
 * Returns a human-readable summary of the deployment configuration.
 */
export function getDeploymentSummary(config: DeploymentConfig): string {
  const lines: string[] = [];

  lines.push('SpecTree Deployment Summary');
  lines.push('==========================');
  lines.push('');
  lines.push(`Mode:     ${config.mode}`);
  lines.push(`Domain:   ${config.domain}`);
  lines.push(`Port:     ${config.port}`);
  lines.push(`SSL:      ${config.ssl ? 'Enabled' : 'Disabled'}`);
  lines.push('');
  lines.push('Database');
  lines.push('--------');
  lines.push(`  Type:   ${config.database.type}`);
  lines.push(`  Host:   ${config.database.host}`);
  lines.push(`  Port:   ${config.database.port}`);
  lines.push(`  Name:   ${config.database.name}`);
  lines.push(`  SSL:    ${config.database.ssl ? 'Enabled' : 'Disabled'}`);
  lines.push('');
  lines.push('Storage');
  lines.push('-------');
  lines.push(`  Type:   ${config.storage.type}`);

  if (config.storage.bucket) {
    lines.push(`  Bucket: ${config.storage.bucket}`);
  }

  if (config.storage.region) {
    lines.push(`  Region: ${config.storage.region}`);
  }

  if (config.storage.localPath) {
    lines.push(`  Path:   ${config.storage.localPath}`);
  }

  lines.push('');
  lines.push('Authentication');
  lines.push('--------------');
  lines.push(`  Provider:        ${config.auth.provider}`);
  lines.push(`  Session Timeout: ${config.auth.sessionTimeout}s`);
  lines.push(`  MFA:             ${config.auth.mfaEnabled ? 'Enabled' : 'Disabled'}`);
  lines.push('');

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildDatabaseUrl(db: DatabaseConfig): string {
  if (db.type === 'sqlite') {
    return `sqlite:./${db.name}.db`;
  }

  const protocol = db.type === 'postgresql' ? 'postgresql' : 'mysql';
  const sslParam = db.ssl ? '?sslmode=require' : '';
  return `${protocol}://spectree:\${DB_PASSWORD}@${db.host}:${db.port}/${db.name}${sslParam}`;
}
