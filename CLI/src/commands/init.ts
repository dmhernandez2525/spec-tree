// SpecTree CLI - Init Command (F3.1.4)

import { Command } from 'commander';
import * as readline from 'node:readline';
import { CliConfig, OutputFormat } from '../types';
import { saveConfig, DEFAULT_CONFIG } from '../config';

/**
 * Prompts the user for input via stdin/stdout and returns the entered value.
 */
function promptUser(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

interface InitOptions {
  name?: string;
  format?: OutputFormat;
  apiUrl?: string;
  apiKey?: string;
}

/**
 * Creates and returns the `spectree init` command.
 * This command initializes a new SpecTree project by creating
 * a .spectreerc configuration file in the current directory.
 */
export function createInitCommand(): Command {
  const cmd = new Command('init')
    .description('Initialize a new SpecTree project')
    .option('--name <name>', 'Project name')
    .option(
      '--format <format>',
      'Default output format (json, yaml, markdown, csv)',
      'json'
    )
    .option(
      '--api-url <url>',
      'API URL',
      DEFAULT_CONFIG.apiUrl
    )
    .option('--api-key <key>', 'API key for authentication')
    .action(async (options: InitOptions) => {
      try {
        const projectName = options.name || 'spectree-project';
        let apiKey = options.apiKey || '';

        if (!apiKey) {
          apiKey = await promptUser(
            'Enter your SpecTree API key (or press Enter to skip): '
          );
        }

        const config: CliConfig = {
          projectName,
          apiKey,
          apiUrl: options.apiUrl || DEFAULT_CONFIG.apiUrl!,
          defaultFormat: options.format || DEFAULT_CONFIG.defaultFormat!,
          outputDir: '.',
        };

        saveConfig(config);

        console.log('');
        console.log(`SpecTree project "${projectName}" initialized successfully.`);
        console.log('');
        console.log('Configuration saved to .spectreerc');
        console.log('');
        console.log('Next steps:');
        console.log('  spectree spec create --title "My Feature" --type epic');
        console.log('  spectree spec list');
        console.log('  spectree export --format json');

        if (!apiKey) {
          console.log('');
          console.log(
            'Note: No API key was provided. You can add one later by editing .spectreerc or running "spectree init" again.'
          );
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error initializing project: ${message}`);
        process.exitCode = 1;
      }
    });

  return cmd;
}
