// Tests for SpecTree CLI Command creation and structure

import { describe, it, expect } from 'vitest';
import { Command } from 'commander';
import { createInitCommand } from './init';
import { createSpecCommand } from './spec';
import { createExportCommand } from './export';
import { createSyncCommand } from './sync';
import { createWatchCommand } from './watch';
import { createCompletionCommand } from './completion';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the long option names for a command (e.g. ['--format', '--output']).
 */
function getOptionNames(cmd: Command): string[] {
  return cmd.options.map((opt) => opt.long ?? opt.short ?? '');
}

/**
 * Returns the names of all direct subcommands for a command.
 */
function getSubcommandNames(cmd: Command): string[] {
  return cmd.commands.map((sub) => sub.name());
}

// ---------------------------------------------------------------------------
// init command
// ---------------------------------------------------------------------------

describe('init command', () => {
  it('creates a command with the name "init"', () => {
    const cmd = createInitCommand();

    expect(cmd).toBeInstanceOf(Command);
    expect(cmd.name()).toBe('init');
  });

  it('has a description', () => {
    const cmd = createInitCommand();

    expect(cmd.description()).toBe('Initialize a new SpecTree project');
  });

  it('has --name option', () => {
    const cmd = createInitCommand();
    const names = getOptionNames(cmd);

    expect(names).toContain('--name');
  });

  it('has --format option', () => {
    const cmd = createInitCommand();
    const names = getOptionNames(cmd);

    expect(names).toContain('--format');
  });

  it('has --api-url option', () => {
    const cmd = createInitCommand();
    const names = getOptionNames(cmd);

    expect(names).toContain('--api-url');
  });

  it('has --api-key option', () => {
    const cmd = createInitCommand();
    const names = getOptionNames(cmd);

    expect(names).toContain('--api-key');
  });
});

// ---------------------------------------------------------------------------
// spec command
// ---------------------------------------------------------------------------

describe('spec command', () => {
  it('creates a command with the name "spec"', () => {
    const cmd = createSpecCommand();

    expect(cmd).toBeInstanceOf(Command);
    expect(cmd.name()).toBe('spec');
  });

  it('has a description', () => {
    const cmd = createSpecCommand();

    expect(cmd.description()).toBe('Manage specifications');
  });

  it('has a "list" subcommand', () => {
    const cmd = createSpecCommand();
    const subs = getSubcommandNames(cmd);

    expect(subs).toContain('list');
  });

  it('has a "get" subcommand', () => {
    const cmd = createSpecCommand();
    const subs = getSubcommandNames(cmd);

    expect(subs).toContain('get');
  });

  it('has a "create" subcommand', () => {
    const cmd = createSpecCommand();
    const subs = getSubcommandNames(cmd);

    expect(subs).toContain('create');
  });

  it('has an "update" subcommand', () => {
    const cmd = createSpecCommand();
    const subs = getSubcommandNames(cmd);

    expect(subs).toContain('update');
  });

  it('has a "delete" subcommand', () => {
    const cmd = createSpecCommand();
    const subs = getSubcommandNames(cmd);

    expect(subs).toContain('delete');
  });

  it('has exactly 5 subcommands (list, get, create, update, delete)', () => {
    const cmd = createSpecCommand();

    expect(cmd.commands).toHaveLength(5);
  });
});

// ---------------------------------------------------------------------------
// export command
// ---------------------------------------------------------------------------

describe('export command', () => {
  it('creates a command with the name "export"', () => {
    const cmd = createExportCommand();

    expect(cmd).toBeInstanceOf(Command);
    expect(cmd.name()).toBe('export');
  });

  it('has a description', () => {
    const cmd = createExportCommand();

    expect(cmd.description()).toBe('Export specifications');
  });

  it('has --format option', () => {
    const cmd = createExportCommand();
    const names = getOptionNames(cmd);

    expect(names).toContain('--format');
  });

  it('has --output option', () => {
    const cmd = createExportCommand();
    const names = getOptionNames(cmd);

    expect(names).toContain('--output');
  });

  it('has --type option', () => {
    const cmd = createExportCommand();
    const names = getOptionNames(cmd);

    expect(names).toContain('--type');
  });

  it('has --include-metadata option', () => {
    const cmd = createExportCommand();
    const names = getOptionNames(cmd);

    expect(names).toContain('--include-metadata');
  });

  it('has --pretty option', () => {
    const cmd = createExportCommand();
    const names = getOptionNames(cmd);

    expect(names).toContain('--pretty');
  });
});

// ---------------------------------------------------------------------------
// sync command
// ---------------------------------------------------------------------------

describe('sync command', () => {
  it('creates a command with the name "sync"', () => {
    const cmd = createSyncCommand();

    expect(cmd).toBeInstanceOf(Command);
    expect(cmd.name()).toBe('sync');
  });

  it('has a description', () => {
    const cmd = createSyncCommand();

    expect(cmd.description()).toBe('Sync specifications with remote');
  });

  it('has --direction option', () => {
    const cmd = createSyncCommand();
    const names = getOptionNames(cmd);

    expect(names).toContain('--direction');
  });

  it('has --dry-run option', () => {
    const cmd = createSyncCommand();
    const names = getOptionNames(cmd);

    expect(names).toContain('--dry-run');
  });

  it('has --force option', () => {
    const cmd = createSyncCommand();
    const names = getOptionNames(cmd);

    expect(names).toContain('--force');
  });
});

// ---------------------------------------------------------------------------
// watch command
// ---------------------------------------------------------------------------

describe('watch command', () => {
  it('creates a command with the name "watch"', () => {
    const cmd = createWatchCommand();

    expect(cmd).toBeInstanceOf(Command);
    expect(cmd.name()).toBe('watch');
  });

  it('has a description', () => {
    const cmd = createWatchCommand();

    expect(cmd.description()).toBe('Watch for specification changes');
  });

  it('has --dir option', () => {
    const cmd = createWatchCommand();
    const names = getOptionNames(cmd);

    expect(names).toContain('--dir');
  });

  it('has --debounce option', () => {
    const cmd = createWatchCommand();
    const names = getOptionNames(cmd);

    expect(names).toContain('--debounce');
  });
});

// ---------------------------------------------------------------------------
// completion command
// ---------------------------------------------------------------------------

describe('completion command', () => {
  it('creates a command with the name "completion"', () => {
    const cmd = createCompletionCommand();

    expect(cmd).toBeInstanceOf(Command);
    expect(cmd.name()).toBe('completion');
  });

  it('has a description', () => {
    const cmd = createCompletionCommand();

    expect(cmd.description()).toBe('Generate shell completion scripts');
  });

  it('has a "bash" subcommand', () => {
    const cmd = createCompletionCommand();
    const subs = getSubcommandNames(cmd);

    expect(subs).toContain('bash');
  });

  it('has a "zsh" subcommand', () => {
    const cmd = createCompletionCommand();
    const subs = getSubcommandNames(cmd);

    expect(subs).toContain('zsh');
  });

  it('has a "fish" subcommand', () => {
    const cmd = createCompletionCommand();
    const subs = getSubcommandNames(cmd);

    expect(subs).toContain('fish');
  });

  it('has exactly 3 subcommands (bash, zsh, fish)', () => {
    const cmd = createCompletionCommand();

    expect(cmd.commands).toHaveLength(3);
  });
});
