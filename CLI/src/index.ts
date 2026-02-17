#!/usr/bin/env node

/**
 * SpecTree CLI - Command-line interface for managing specifications.
 * F3.1.4 - CLI Tool
 */

import { Command } from 'commander';
import { createInitCommand } from './commands/init';
import { createSpecCommand } from './commands/spec';
import { createExportCommand } from './commands/export';
import { createSyncCommand } from './commands/sync';
import { createWatchCommand } from './commands/watch';
import { createCompletionCommand } from './commands/completion';

const program = new Command();

program
  .name('spectree')
  .description('SpecTree CLI - Manage specifications from the command line')
  .version('1.0.0');

program.addCommand(createInitCommand());
program.addCommand(createSpecCommand());
program.addCommand(createExportCommand());
program.addCommand(createSyncCommand());
program.addCommand(createWatchCommand());
program.addCommand(createCompletionCommand());

program.parse();
