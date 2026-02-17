// Tests for SpecTree CLI Configuration Management

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  findConfigFile,
  loadConfig,
  saveConfig,
  getApiHeaders,
  validateConfig,
  CONFIG_FILENAME,
  DEFAULT_CONFIG,
} from './config';
import { CliConfig, CliError } from './types';

vi.mock('node:fs');
vi.mock('node:path');
vi.mock('node:os');

const mockFs = vi.mocked(fs);
const mockPath = vi.mocked(path);
const mockOs = vi.mocked(os);

function makeConfig(overrides: Partial<CliConfig> = {}): CliConfig {
  return {
    apiKey: 'test-key-123',
    apiUrl: 'https://api.spectree.dev/v1',
    defaultFormat: 'json',
    projectName: 'test-project',
    outputDir: '.',
    ...overrides,
  };
}

describe('findConfigFile', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockOs.homedir.mockReturnValue('/home/user');
    mockPath.join.mockImplementation((...segments) => segments.join('/'));
    mockPath.dirname.mockImplementation((p: string) => {
      const parts = p.split('/');
      parts.pop();
      return parts.join('/') || '/';
    });
  });

  it('returns path when config file exists in cwd', () => {
    vi.spyOn(process, 'cwd').mockReturnValue('/home/user/project');
    mockFs.existsSync.mockReturnValue(true);

    const result = findConfigFile();

    expect(result).toBe('/home/user/project/.spectreerc');
    expect(mockFs.existsSync).toHaveBeenCalledWith('/home/user/project/.spectreerc');
  });

  it('returns path when config file exists in parent directory', () => {
    vi.spyOn(process, 'cwd').mockReturnValue('/home/user/project/sub');
    mockFs.existsSync
      .mockReturnValueOnce(false)  // /home/user/project/sub/.spectreerc
      .mockReturnValueOnce(true);  // /home/user/project/.spectreerc

    const result = findConfigFile();

    expect(result).toBe('/home/user/project/.spectreerc');
  });

  it('returns null when no config file is found', () => {
    vi.spyOn(process, 'cwd').mockReturnValue('/home/user');
    mockFs.existsSync.mockReturnValue(false);

    const result = findConfigFile();

    expect(result).toBeNull();
  });

  it('stops searching at home directory', () => {
    vi.spyOn(process, 'cwd').mockReturnValue('/home/user/deep/nested');
    mockFs.existsSync.mockReturnValue(false);

    findConfigFile();

    // Should not search above home directory
    const calls = mockFs.existsSync.mock.calls.map((c) => c[0]);
    const aboveHome = calls.filter(
      (p) => typeof p === 'string' && !p.startsWith('/home/user')
    );
    expect(aboveHome).toHaveLength(0);
  });

  it('stops searching at filesystem root', () => {
    mockOs.homedir.mockReturnValue('/some/other/place');
    vi.spyOn(process, 'cwd').mockReturnValue('/tmp');
    mockFs.existsSync.mockReturnValue(false);
    // Simulate dirname('/') returning '/'
    mockPath.dirname.mockImplementation((p: string) => {
      if (p === '/' || p === '') return '/';
      const parts = p.split('/');
      parts.pop();
      return parts.join('/') || '/';
    });

    const result = findConfigFile();

    expect(result).toBeNull();
  });
});

describe('loadConfig', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockOs.homedir.mockReturnValue('/home/user');
    mockPath.join.mockImplementation((...segments) => segments.join('/'));
    mockPath.dirname.mockImplementation((p: string) => {
      const parts = p.split('/');
      parts.pop();
      return parts.join('/') || '/';
    });
  });

  it('returns default config when no config file is found', () => {
    vi.spyOn(process, 'cwd').mockReturnValue('/home/user');
    mockFs.existsSync.mockReturnValue(false);

    const config = loadConfig();

    expect(config.apiUrl).toBe(DEFAULT_CONFIG.apiUrl);
    expect(config.defaultFormat).toBe(DEFAULT_CONFIG.defaultFormat);
  });

  it('merges file config with defaults', () => {
    vi.spyOn(process, 'cwd').mockReturnValue('/home/user/project');
    mockFs.existsSync.mockReturnValue(true);

    const fileContent = JSON.stringify({
      apiKey: 'my-key',
      projectName: 'my-project',
    });
    mockFs.readFileSync.mockReturnValue(fileContent);

    const config = loadConfig();

    expect(config.apiKey).toBe('my-key');
    expect(config.projectName).toBe('my-project');
    // Defaults should still be present
    expect(config.apiUrl).toBe(DEFAULT_CONFIG.apiUrl);
    expect(config.defaultFormat).toBe(DEFAULT_CONFIG.defaultFormat);
  });

  it('file values override defaults', () => {
    vi.spyOn(process, 'cwd').mockReturnValue('/home/user/project');
    mockFs.existsSync.mockReturnValue(true);

    const fileContent = JSON.stringify({
      apiUrl: 'https://custom.api/v2',
      defaultFormat: 'yaml',
    });
    mockFs.readFileSync.mockReturnValue(fileContent);

    const config = loadConfig();

    expect(config.apiUrl).toBe('https://custom.api/v2');
    expect(config.defaultFormat).toBe('yaml');
  });

  it('throws CliError on invalid JSON', () => {
    vi.spyOn(process, 'cwd').mockReturnValue('/home/user/project');
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue('{ invalid json !!!');

    expect(() => loadConfig()).toThrow(CliError);
    expect(() => loadConfig()).toThrow(/Failed to load config/);
  });

  it('throws CliError with CONFIG_LOAD_ERROR code on read failure', () => {
    vi.spyOn(process, 'cwd').mockReturnValue('/home/user/project');
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockImplementation(() => {
      throw new Error('Permission denied');
    });

    try {
      loadConfig();
      expect.fail('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(CliError);
      expect((err as CliError).code).toBe('CONFIG_LOAD_ERROR');
    }
  });
});

describe('saveConfig', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockPath.join.mockImplementation((...segments) => segments.join('/'));
  });

  it('writes config to file as formatted JSON', () => {
    vi.spyOn(process, 'cwd').mockReturnValue('/home/user/project');

    const config = makeConfig();
    saveConfig(config);

    expect(mockFs.writeFileSync).toHaveBeenCalledTimes(1);
    const [filePath, content, encoding] =
      mockFs.writeFileSync.mock.calls[0] as [string, string, string];
    expect(filePath).toBe('/home/user/project/.spectreerc');
    expect(encoding).toBe('utf-8');
    // Content should be valid JSON ending with a newline
    expect(content.endsWith('\n')).toBe(true);
    const parsed = JSON.parse(content);
    expect(parsed.apiKey).toBe('test-key-123');
    expect(parsed.projectName).toBe('test-project');
  });

  it('produces pretty-printed JSON with 2-space indent', () => {
    vi.spyOn(process, 'cwd').mockReturnValue('/tmp');

    const config = makeConfig();
    saveConfig(config);

    const content = mockFs.writeFileSync.mock.calls[0][1] as string;
    const expected = JSON.stringify(config, null, 2) + '\n';
    expect(content).toBe(expected);
  });

  it('throws CliError on write failure', () => {
    vi.spyOn(process, 'cwd').mockReturnValue('/home/user/project');
    mockFs.writeFileSync.mockImplementation(() => {
      throw new Error('Disk full');
    });

    const config = makeConfig();

    expect(() => saveConfig(config)).toThrow(CliError);
    expect(() => saveConfig(config)).toThrow(/Failed to save config/);
  });

  it('throws CliError with CONFIG_SAVE_ERROR code', () => {
    vi.spyOn(process, 'cwd').mockReturnValue('/home/user/project');
    mockFs.writeFileSync.mockImplementation(() => {
      throw new Error('Read-only filesystem');
    });

    try {
      saveConfig(makeConfig());
      expect.fail('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(CliError);
      expect((err as CliError).code).toBe('CONFIG_SAVE_ERROR');
    }
  });
});

describe('getApiHeaders', () => {
  it('returns correct headers with bearer token', () => {
    const config = makeConfig({ apiKey: 'sk-abc123' });
    const headers = getApiHeaders(config);

    expect(headers).toEqual({
      Authorization: 'Bearer sk-abc123',
      'Content-Type': 'application/json',
    });
  });

  it('includes the exact apiKey in the Authorization header', () => {
    const config = makeConfig({ apiKey: 'my-secret-token' });
    const headers = getApiHeaders(config);

    expect(headers.Authorization).toBe('Bearer my-secret-token');
  });

  it('always sets Content-Type to application/json', () => {
    const config = makeConfig();
    const headers = getApiHeaders(config);

    expect(headers['Content-Type']).toBe('application/json');
  });
});

describe('validateConfig', () => {
  it('throws CliError when apiKey is missing', () => {
    const config = makeConfig({ apiKey: '' });

    expect(() => validateConfig(config)).toThrow(CliError);
    expect(() => validateConfig(config)).toThrow(/API key is required/);
  });

  it('throws with MISSING_API_KEY code when apiKey is empty', () => {
    const config = makeConfig({ apiKey: '' });

    try {
      validateConfig(config);
      expect.fail('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(CliError);
      expect((err as CliError).code).toBe('MISSING_API_KEY');
    }
  });

  it('throws CliError when apiUrl is missing', () => {
    const config = makeConfig({ apiUrl: '' });

    expect(() => validateConfig(config)).toThrow(CliError);
    expect(() => validateConfig(config)).toThrow(/API URL is required/);
  });

  it('throws with MISSING_API_URL code when apiUrl is empty', () => {
    const config = makeConfig({ apiUrl: '' });

    try {
      validateConfig(config);
      expect.fail('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(CliError);
      expect((err as CliError).code).toBe('MISSING_API_URL');
    }
  });

  it('passes validation with a valid config', () => {
    const config = makeConfig();

    expect(() => validateConfig(config)).not.toThrow();
  });

  it('checks apiKey before apiUrl (apiKey error takes precedence)', () => {
    const config = makeConfig({ apiKey: '', apiUrl: '' });

    try {
      validateConfig(config);
      expect.fail('Should have thrown');
    } catch (err) {
      expect((err as CliError).code).toBe('MISSING_API_KEY');
    }
  });
});
