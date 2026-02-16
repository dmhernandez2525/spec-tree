import { describe, it, expect } from 'vitest';
import {
  DEFAULT_DB_PORTS,
  SYSTEM_REQUIREMENTS,
  DEFAULT_SELF_HOSTED_CONFIG,
  createDeploymentConfig,
  validateConfig,
  validateDomain,
  validateEnvironment,
  generateDockerCompose,
  generateEnvFile,
  createMigrationStep,
  getMigrationPlan,
  generateNginxConfig,
  estimateResources,
  getDeploymentSummary,
} from './self-hosted';
import type { DeploymentConfig, MigrationStep } from './self-hosted';

// ---------------------------------------------------------------------------
// DEFAULT_DB_PORTS
// ---------------------------------------------------------------------------

describe('DEFAULT_DB_PORTS', () => {
  it('should have postgresql port 5432', () => {
    expect(DEFAULT_DB_PORTS.postgresql).toBe(5432);
  });

  it('should have mysql port 3306', () => {
    expect(DEFAULT_DB_PORTS.mysql).toBe(3306);
  });

  it('should have sqlite port 0', () => {
    expect(DEFAULT_DB_PORTS.sqlite).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// SYSTEM_REQUIREMENTS
// ---------------------------------------------------------------------------

describe('SYSTEM_REQUIREMENTS', () => {
  it('should require minimum 2048 MB memory', () => {
    expect(SYSTEM_REQUIREMENTS.minMemoryMB).toBe(2048);
  });

  it('should require minimum 10 GB disk', () => {
    expect(SYSTEM_REQUIREMENTS.minDiskGB).toBe(10);
  });

  it('should require minimum 2 CPU cores', () => {
    expect(SYSTEM_REQUIREMENTS.minCpuCores).toBe(2);
  });

  it('should require ports 3000 and 5432', () => {
    expect(SYSTEM_REQUIREMENTS.requiredPorts).toEqual([3000, 5432]);
  });
});

// ---------------------------------------------------------------------------
// DEFAULT_SELF_HOSTED_CONFIG
// ---------------------------------------------------------------------------

describe('DEFAULT_SELF_HOSTED_CONFIG', () => {
  it('should have mode self-hosted', () => {
    expect(DEFAULT_SELF_HOSTED_CONFIG.mode).toBe('self-hosted');
  });

  it('should use postgresql by default', () => {
    expect(DEFAULT_SELF_HOSTED_CONFIG.database.type).toBe('postgresql');
  });

  it('should use localhost as the database host', () => {
    expect(DEFAULT_SELF_HOSTED_CONFIG.database.host).toBe('localhost');
  });

  it('should use local storage by default', () => {
    expect(DEFAULT_SELF_HOSTED_CONFIG.storage.type).toBe('local');
  });

  it('should use internal auth provider', () => {
    expect(DEFAULT_SELF_HOSTED_CONFIG.auth.provider).toBe('internal');
  });

  it('should default to port 3000', () => {
    expect(DEFAULT_SELF_HOSTED_CONFIG.port).toBe(3000);
  });

  it('should default ssl to false', () => {
    expect(DEFAULT_SELF_HOSTED_CONFIG.ssl).toBe(false);
  });

  it('should default domain to localhost', () => {
    expect(DEFAULT_SELF_HOSTED_CONFIG.domain).toBe('localhost');
  });
});

// ---------------------------------------------------------------------------
// createDeploymentConfig
// ---------------------------------------------------------------------------

describe('createDeploymentConfig', () => {
  it('should return the default config when no overrides provided', () => {
    const config = createDeploymentConfig();
    expect(config.mode).toBe('self-hosted');
    expect(config.port).toBe(3000);
    expect(config.domain).toBe('localhost');
  });

  it('should apply top-level overrides', () => {
    const config = createDeploymentConfig({ port: 8080, domain: 'example.com' });
    expect(config.port).toBe(8080);
    expect(config.domain).toBe('example.com');
  });

  it('should deep merge nested database overrides', () => {
    const config = createDeploymentConfig({
      database: { type: 'mysql', host: 'db.example.com', port: 3306, name: 'mydb', ssl: true },
    });
    expect(config.database.type).toBe('mysql');
    expect(config.database.host).toBe('db.example.com');
  });

  it('should preserve non-overridden nested values', () => {
    const config = createDeploymentConfig({ ssl: true });
    expect(config.database.type).toBe('postgresql');
    expect(config.storage.type).toBe('local');
  });

  it('should return a new object, not the same reference as the default', () => {
    const config = createDeploymentConfig();
    expect(config).not.toBe(DEFAULT_SELF_HOSTED_CONFIG);
  });
});

// ---------------------------------------------------------------------------
// validateConfig
// ---------------------------------------------------------------------------

describe('validateConfig', () => {
  it('should return valid for the default config (localhost, no SSL is fine)', () => {
    const config = createDeploymentConfig();
    const result = validateConfig(config);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail when domain is empty', () => {
    const config = createDeploymentConfig({ domain: '' });
    const result = validateConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Domain must not be empty');
  });

  it('should fail when port is below 1', () => {
    const config = createDeploymentConfig({ port: 0 });
    const result = validateConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Port must be between 1 and 65535');
  });

  it('should fail when port is above 65535', () => {
    const config = createDeploymentConfig({ port: 70000 });
    const result = validateConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Port must be between 1 and 65535');
  });

  it('should fail when database host is empty', () => {
    const config = createDeploymentConfig({
      database: { type: 'postgresql', host: '', port: 5432, name: 'db', ssl: false },
    });
    const result = validateConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Database host must not be empty');
  });

  it('should warn about SSL for non-localhost domains', () => {
    const config = createDeploymentConfig({ domain: 'example.com', ssl: false });
    const result = validateConfig(config);
    expect(result.errors).toContain('SSL is recommended for non-localhost deployments');
  });

  it('should not warn about SSL for localhost', () => {
    const config = createDeploymentConfig({ domain: 'localhost', ssl: false });
    const result = validateConfig(config);
    expect(result.errors).not.toContain('SSL is recommended for non-localhost deployments');
  });

  it('should not warn about SSL when SSL is enabled', () => {
    const config = createDeploymentConfig({ domain: 'example.com', ssl: true });
    const result = validateConfig(config);
    expect(result.errors).not.toContain('SSL is recommended for non-localhost deployments');
  });
});

// ---------------------------------------------------------------------------
// validateDomain
// ---------------------------------------------------------------------------

describe('validateDomain', () => {
  it('should accept localhost', () => {
    expect(validateDomain('localhost')).toBe(true);
  });

  it('should accept a valid domain', () => {
    expect(validateDomain('example.com')).toBe(true);
  });

  it('should accept a subdomain', () => {
    expect(validateDomain('app.example.com')).toBe(true);
  });

  it('should accept a valid IPv4 address', () => {
    expect(validateDomain('192.168.1.1')).toBe(true);
  });

  it('should reject an empty string', () => {
    expect(validateDomain('')).toBe(false);
  });

  it('should reject a domain with invalid characters', () => {
    expect(validateDomain('not a domain!')).toBe(false);
  });

  it('should reject an IPv4 with octet > 255', () => {
    expect(validateDomain('256.1.1.1')).toBe(false);
  });

  it('should accept 127.0.0.1', () => {
    expect(validateDomain('127.0.0.1')).toBe(true);
  });

  it('should reject whitespace-only string', () => {
    expect(validateDomain('   ')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateEnvironment
// ---------------------------------------------------------------------------

describe('validateEnvironment', () => {
  const config = createDeploymentConfig();

  it('should pass all checks when requirements are met', () => {
    const checks = validateEnvironment(config, {
      memoryMB: 4096,
      diskGB: 50,
      cpuCores: 4,
      availablePorts: [3000, 5432],
    });
    const allPass = checks.every((c) => c.status === 'pass');
    expect(allPass).toBe(true);
  });

  it('should fail memory check when below minimum', () => {
    const checks = validateEnvironment(config, {
      memoryMB: 1024,
      diskGB: 50,
      cpuCores: 4,
      availablePorts: [3000, 5432],
    });
    const memCheck = checks.find((c) => c.name === 'Memory');
    expect(memCheck?.status).toBe('fail');
  });

  it('should fail disk check when below minimum', () => {
    const checks = validateEnvironment(config, {
      memoryMB: 4096,
      diskGB: 5,
      cpuCores: 4,
      availablePorts: [3000, 5432],
    });
    const diskCheck = checks.find((c) => c.name === 'Disk Space');
    expect(diskCheck?.status).toBe('fail');
  });

  it('should fail port check when required port is unavailable', () => {
    const checks = validateEnvironment(config, {
      memoryMB: 4096,
      diskGB: 50,
      cpuCores: 4,
      availablePorts: [5432], // missing 3000
    });
    const portCheck = checks.find((c) => c.name === 'Port 3000');
    expect(portCheck?.status).toBe('fail');
  });

  it('should include the config port in checks', () => {
    const customConfig = createDeploymentConfig({ port: 8080 });
    const checks = validateEnvironment(customConfig, {
      memoryMB: 4096,
      diskGB: 50,
      cpuCores: 4,
      availablePorts: [3000, 5432, 8080],
    });
    const portCheck = checks.find((c) => c.name === 'Port 8080');
    expect(portCheck?.status).toBe('pass');
  });

  it('should include a CPU check', () => {
    const checks = validateEnvironment(config, {
      memoryMB: 4096,
      diskGB: 50,
      cpuCores: 1,
      availablePorts: [3000, 5432],
    });
    const cpuCheck = checks.find((c) => c.name === 'CPU Cores');
    expect(cpuCheck?.status).toBe('fail');
  });
});

// ---------------------------------------------------------------------------
// generateDockerCompose
// ---------------------------------------------------------------------------

describe('generateDockerCompose', () => {
  it('should contain version 3.8', () => {
    const output = generateDockerCompose(createDeploymentConfig());
    expect(output).toContain('version: "3.8"');
  });

  it('should contain services section', () => {
    const output = generateDockerCompose(createDeploymentConfig());
    expect(output).toContain('services:');
  });

  it('should contain app service', () => {
    const output = generateDockerCompose(createDeploymentConfig());
    expect(output).toContain('  app:');
  });

  it('should contain db service for postgresql', () => {
    const output = generateDockerCompose(createDeploymentConfig());
    expect(output).toContain('  db:');
    expect(output).toContain('postgres:16-alpine');
  });

  it('should contain mysql image for mysql config', () => {
    const config = createDeploymentConfig({
      database: { type: 'mysql', host: 'localhost', port: 3306, name: 'spectree', ssl: false },
    });
    const output = generateDockerCompose(config);
    expect(output).toContain('mysql:8');
  });

  it('should include the configured port mapping', () => {
    const config = createDeploymentConfig({ port: 8080 });
    const output = generateDockerCompose(config);
    expect(output).toContain('"8080:8080"');
  });

  it('should include minio service for self-hosted s3 storage', () => {
    const config = createDeploymentConfig({ storage: { type: 's3' } });
    const output = generateDockerCompose(config);
    expect(output).toContain('minio:');
    expect(output).toContain('minio/minio:latest');
  });

  it('should include volumes section', () => {
    const output = generateDockerCompose(createDeploymentConfig());
    expect(output).toContain('volumes:');
    expect(output).toContain('  db_data:');
  });
});

// ---------------------------------------------------------------------------
// generateEnvFile
// ---------------------------------------------------------------------------

describe('generateEnvFile', () => {
  it('should contain DATABASE_URL', () => {
    const output = generateEnvFile(createDeploymentConfig());
    expect(output).toContain('DATABASE_URL=');
  });

  it('should contain STORAGE_TYPE', () => {
    const output = generateEnvFile(createDeploymentConfig());
    expect(output).toContain('STORAGE_TYPE=local');
  });

  it('should contain AUTH_PROVIDER', () => {
    const output = generateEnvFile(createDeploymentConfig());
    expect(output).toContain('AUTH_PROVIDER=internal');
  });

  it('should contain DEPLOYMENT_MODE', () => {
    const output = generateEnvFile(createDeploymentConfig());
    expect(output).toContain('DEPLOYMENT_MODE=self-hosted');
  });

  it('should contain STORAGE_LOCAL_PATH for local storage', () => {
    const output = generateEnvFile(createDeploymentConfig());
    expect(output).toContain('STORAGE_LOCAL_PATH=./data/storage');
  });

  it('should include storage access keys for s3 storage', () => {
    const config = createDeploymentConfig({
      storage: { type: 's3', bucket: 'my-bucket', region: 'us-east-1' },
    });
    const output = generateEnvFile(config);
    expect(output).toContain('STORAGE_BUCKET=my-bucket');
    expect(output).toContain('STORAGE_REGION=us-east-1');
    expect(output).toContain('STORAGE_ACCESS_KEY=changeme');
    expect(output).toContain('STORAGE_SECRET_KEY=changeme');
  });

  it('should contain the configured port', () => {
    const config = createDeploymentConfig({ port: 9090 });
    const output = generateEnvFile(config);
    expect(output).toContain('PORT=9090');
  });
});

// ---------------------------------------------------------------------------
// createMigrationStep
// ---------------------------------------------------------------------------

describe('createMigrationStep', () => {
  it('should set version correctly', () => {
    const step = createMigrationStep('001', 'Create users table', 'CREATE TABLE users', 'DROP TABLE users');
    expect(step.version).toBe('001');
  });

  it('should set description correctly', () => {
    const step = createMigrationStep('001', 'Create users table', 'UP SQL', 'DOWN SQL');
    expect(step.description).toBe('Create users table');
  });

  it('should set up and down SQL', () => {
    const step = createMigrationStep('002', 'Add index', 'CREATE INDEX', 'DROP INDEX');
    expect(step.up).toBe('CREATE INDEX');
    expect(step.down).toBe('DROP INDEX');
  });

  it('should not have appliedAt set', () => {
    const step = createMigrationStep('001', 'desc', 'up', 'down');
    expect(step.appliedAt).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getMigrationPlan
// ---------------------------------------------------------------------------

describe('getMigrationPlan', () => {
  const available: MigrationStep[] = [
    { version: '001', description: 'A', up: 'up1', down: 'down1' },
    { version: '002', description: 'B', up: 'up2', down: 'down2' },
    { version: '003', description: 'C', up: 'up3', down: 'down3' },
  ];

  it('should return unapplied migrations', () => {
    const applied: MigrationStep[] = [
      { version: '001', description: 'A', up: 'up1', down: 'down1', appliedAt: 1000 },
    ];
    const plan = getMigrationPlan(applied, available);
    expect(plan).toHaveLength(2);
    expect(plan[0].version).toBe('002');
    expect(plan[1].version).toBe('003');
  });

  it('should return all migrations when none applied', () => {
    const plan = getMigrationPlan([], available);
    expect(plan).toHaveLength(3);
  });

  it('should return empty when all applied', () => {
    const applied = available.map((m) => ({ ...m, appliedAt: Date.now() }));
    const plan = getMigrationPlan(applied, available);
    expect(plan).toHaveLength(0);
  });

  it('should handle empty available list', () => {
    const plan = getMigrationPlan([], []);
    expect(plan).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// generateNginxConfig
// ---------------------------------------------------------------------------

describe('generateNginxConfig', () => {
  it('should contain server block for HTTP-only config', () => {
    const config = createDeploymentConfig();
    const output = generateNginxConfig(config);
    expect(output).toContain('server {');
    expect(output).toContain('listen 80;');
  });

  it('should contain proxy_pass with configured port', () => {
    const config = createDeploymentConfig({ port: 4000 });
    const output = generateNginxConfig(config);
    expect(output).toContain('proxy_pass http://127.0.0.1:4000');
  });

  it('should contain server_name with configured domain', () => {
    const config = createDeploymentConfig({ domain: 'app.example.com' });
    const output = generateNginxConfig(config);
    expect(output).toContain('server_name app.example.com');
  });

  it('should include SSL config when ssl is enabled', () => {
    const config = createDeploymentConfig({ domain: 'example.com', ssl: true });
    const output = generateNginxConfig(config);
    expect(output).toContain('listen 443 ssl http2');
    expect(output).toContain('ssl_certificate');
    expect(output).toContain('ssl_certificate_key');
    expect(output).toContain('ssl_protocols TLSv1.2 TLSv1.3');
  });

  it('should include HTTP to HTTPS redirect when ssl is enabled', () => {
    const config = createDeploymentConfig({ domain: 'example.com', ssl: true });
    const output = generateNginxConfig(config);
    expect(output).toContain('return 301 https://$host$request_uri');
  });

  it('should not include SSL blocks when ssl is disabled', () => {
    const config = createDeploymentConfig({ ssl: false });
    const output = generateNginxConfig(config);
    expect(output).not.toContain('listen 443');
    expect(output).not.toContain('ssl_certificate');
  });
});

// ---------------------------------------------------------------------------
// estimateResources
// ---------------------------------------------------------------------------

describe('estimateResources', () => {
  it('should return base resources for 0 users', () => {
    const result = estimateResources(0);
    expect(result.memoryMB).toBe(512);
    expect(result.diskGB).toBe(5);
    expect(result.cpuCores).toBe(1 + Math.ceil(0 / 500));
  });

  it('should scale memory for 100 users', () => {
    const result = estimateResources(100);
    expect(result.memoryMB).toBe(512 + 10 * 100);
  });

  it('should scale disk for 100 users', () => {
    const result = estimateResources(100);
    expect(result.diskGB).toBe(5 + 0.1 * 100);
  });

  it('should scale cpu cores for 1000 users', () => {
    const result = estimateResources(1000);
    expect(result.cpuCores).toBe(1 + Math.ceil(1000 / 500));
  });

  it('should return integer cpu cores', () => {
    const result = estimateResources(250);
    expect(Number.isInteger(result.cpuCores)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getDeploymentSummary
// ---------------------------------------------------------------------------

describe('getDeploymentSummary', () => {
  it('should contain mode', () => {
    const config = createDeploymentConfig();
    const summary = getDeploymentSummary(config);
    expect(summary).toContain('self-hosted');
  });

  it('should contain database type', () => {
    const config = createDeploymentConfig();
    const summary = getDeploymentSummary(config);
    expect(summary).toContain('postgresql');
  });

  it('should contain storage type', () => {
    const config = createDeploymentConfig();
    const summary = getDeploymentSummary(config);
    expect(summary).toContain('local');
  });

  it('should contain domain', () => {
    const config = createDeploymentConfig({ domain: 'deploy.example.com' });
    const summary = getDeploymentSummary(config);
    expect(summary).toContain('deploy.example.com');
  });

  it('should show SSL as Enabled when true', () => {
    const config = createDeploymentConfig({ ssl: true });
    const summary = getDeploymentSummary(config);
    expect(summary).toContain('SSL:      Enabled');
  });

  it('should show SSL as Disabled when false', () => {
    const config = createDeploymentConfig({ ssl: false });
    const summary = getDeploymentSummary(config);
    expect(summary).toContain('SSL:      Disabled');
  });

  it('should contain auth provider', () => {
    const config = createDeploymentConfig();
    const summary = getDeploymentSummary(config);
    expect(summary).toContain('internal');
  });

  it('should contain the title line', () => {
    const config = createDeploymentConfig();
    const summary = getDeploymentSummary(config);
    expect(summary).toContain('SpecTree Deployment Summary');
  });
});
