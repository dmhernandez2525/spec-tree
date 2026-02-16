// SpecTree CLI Configuration Management (F3.1.4)

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { CliConfig, CliError } from './types';

export const CONFIG_FILENAME = '.spectreerc';

export const DEFAULT_CONFIG: Partial<CliConfig> = {
  apiUrl: 'https://api.spectree.dev/v1',
  defaultFormat: 'json',
};

/**
 * Searches for a .spectreerc config file starting from the current directory,
 * walking up the directory tree until reaching the home directory.
 * Returns the full path if found, or null otherwise.
 */
export function findConfigFile(): string | null {
  const homeDir = os.homedir();
  let currentDir = process.cwd();

  while (true) {
    const candidate = path.join(currentDir, CONFIG_FILENAME);

    if (fs.existsSync(candidate)) {
      return candidate;
    }

    // Stop searching once we reach the home directory
    if (currentDir === homeDir) {
      break;
    }

    const parentDir = path.dirname(currentDir);

    // Stop if we hit the filesystem root (parent equals current)
    if (parentDir === currentDir) {
      break;
    }

    currentDir = parentDir;
  }

  return null;
}

/**
 * Loads the config file, parses it as JSON, and merges it with
 * the default configuration values. Returns the merged config.
 * If no config file is found, returns the defaults as a partial config.
 */
export function loadConfig(): CliConfig {
  const configPath = findConfigFile();

  if (!configPath) {
    return { ...DEFAULT_CONFIG } as CliConfig;
  }

  try {
    const raw = fs.readFileSync(configPath, 'utf-8');
    const fileConfig = JSON.parse(raw) as Partial<CliConfig>;

    return {
      ...DEFAULT_CONFIG,
      ...fileConfig,
    } as CliConfig;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error reading config';
    throw new CliError(
      `Failed to load config from ${configPath}: ${message}`,
      'CONFIG_LOAD_ERROR'
    );
  }
}

/**
 * Writes the given config object as JSON to a .spectreerc file
 * in the current working directory.
 */
export function saveConfig(config: CliConfig): void {
  const configPath = path.join(process.cwd(), CONFIG_FILENAME);

  try {
    const content = JSON.stringify(config, null, 2) + '\n';
    fs.writeFileSync(configPath, content, 'utf-8');
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error writing config';
    throw new CliError(
      `Failed to save config to ${configPath}: ${message}`,
      'CONFIG_SAVE_ERROR'
    );
  }
}

/**
 * Builds the HTTP headers needed for API requests, including
 * the Authorization Bearer token and Content-Type.
 */
export function getApiHeaders(
  config: CliConfig
): Record<string, string> {
  return {
    Authorization: `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Validates that all required config fields are present.
 * Throws a CliError if any required field is missing.
 */
export function validateConfig(config: CliConfig): void {
  if (!config.apiKey) {
    throw new CliError(
      'API key is required. Run "spectree init" to configure, or set the apiKey field in your .spectreerc file.',
      'MISSING_API_KEY'
    );
  }

  if (!config.apiUrl) {
    throw new CliError(
      'API URL is required. Ensure your .spectreerc file includes a valid apiUrl field.',
      'MISSING_API_URL'
    );
  }
}
