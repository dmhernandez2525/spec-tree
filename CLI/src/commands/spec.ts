// SpecTree CLI - Spec Command (F3.1.4)

import { Command } from 'commander';
import { CliConfig, CliError, SpecNode, ApiResponse, OutputFormat } from '../types';
import { loadConfig, getApiHeaders, validateConfig } from '../config';
import { formatOutput } from '../formatters';

/**
 * Builds the full API URL for the specs endpoint.
 */
function specsUrl(config: CliConfig, specId?: string): string {
  const base = `${config.apiUrl}/specs`;
  return specId ? `${base}/${specId}` : base;
}

/**
 * Handles an API response, throwing a CliError if the request failed.
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = '';
    try {
      const body = await response.json();
      detail = body.message || body.error || JSON.stringify(body);
    } catch {
      detail = response.statusText;
    }
    throw new CliError(
      `API request failed (${response.status}): ${detail}`,
      'API_ERROR',
      response.status
    );
  }
  return response.json() as Promise<T>;
}

interface ListOptions {
  type?: string;
  format?: OutputFormat;
  page?: string;
  pageSize?: string;
}

interface GetOptions {
  format?: OutputFormat;
}

interface CreateOptions {
  title: string;
  type: string;
  description?: string;
  parentId?: string;
}

interface UpdateOptions {
  title?: string;
  description?: string;
  type?: string;
}

interface DeleteOptions {
  force?: boolean;
}

/**
 * Creates the `list` subcommand, which fetches and displays all specs.
 */
function createListSubcommand(): Command {
  return new Command('list')
    .description('List all specifications')
    .option('--type <type>', 'Filter by spec type (epic, feature, user-story, task)')
    .option('--format <format>', 'Output format (json, yaml, markdown, csv)')
    .option('--page <number>', 'Page number', '1')
    .option('--page-size <number>', 'Items per page', '20')
    .action(async (options: ListOptions) => {
      try {
        const config = loadConfig();
        validateConfig(config);

        const params = new URLSearchParams();
        if (options.type) params.set('type', options.type);
        params.set('page', options.page || '1');
        params.set('pageSize', options.pageSize || '20');

        const url = `${specsUrl(config)}?${params.toString()}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: getApiHeaders(config),
        });

        const result = await handleResponse<ApiResponse<SpecNode[]>>(response);
        const format = options.format || config.defaultFormat;

        console.log(formatOutput(result.data, format));
        console.log(
          `\nShowing page ${result.meta.pagination.page} of ${result.meta.pagination.pageCount} (${result.meta.pagination.total} total)`
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error listing specs: ${message}`);
        process.exitCode = 1;
      }
    });
}

/**
 * Creates the `get` subcommand, which fetches and displays a single spec.
 */
function createGetSubcommand(): Command {
  return new Command('get')
    .description('Get a single specification by ID')
    .argument('<id>', 'Specification ID')
    .option('--format <format>', 'Output format (json, yaml, markdown, csv)')
    .action(async (id: string, options: GetOptions) => {
      try {
        const config = loadConfig();
        validateConfig(config);

        const response = await fetch(specsUrl(config, id), {
          method: 'GET',
          headers: getApiHeaders(config),
        });

        const result = await handleResponse<{ data: SpecNode }>(response);
        const format = options.format || config.defaultFormat;

        console.log(formatOutput(result.data, format));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error fetching spec "${id}": ${message}`);
        process.exitCode = 1;
      }
    });
}

/**
 * Creates the `create` subcommand for creating a new spec.
 */
function createCreateSubcommand(): Command {
  return new Command('create')
    .description('Create a new specification')
    .requiredOption('--title <title>', 'Specification title')
    .requiredOption(
      '--type <type>',
      'Specification type (epic, feature, user-story, task)'
    )
    .option('--description <description>', 'Specification description')
    .option('--parent-id <parentId>', 'Parent specification ID')
    .action(async (options: CreateOptions) => {
      try {
        const config = loadConfig();
        validateConfig(config);

        const body: Record<string, string> = {
          title: options.title,
          type: options.type,
        };
        if (options.description) body.description = options.description;
        if (options.parentId) body.parentId = options.parentId;

        const response = await fetch(specsUrl(config), {
          method: 'POST',
          headers: getApiHeaders(config),
          body: JSON.stringify(body),
        });

        const result = await handleResponse<{ data: SpecNode }>(response);

        console.log(`Specification created successfully (ID: ${result.data.id})`);
        console.log(formatOutput(result.data, config.defaultFormat));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error creating spec: ${message}`);
        process.exitCode = 1;
      }
    });
}

/**
 * Creates the `update` subcommand for updating an existing spec.
 */
function createUpdateSubcommand(): Command {
  return new Command('update')
    .description('Update an existing specification')
    .argument('<id>', 'Specification ID')
    .option('--title <title>', 'New title')
    .option('--description <description>', 'New description')
    .option('--type <type>', 'New type (epic, feature, user-story, task)')
    .action(async (id: string, options: UpdateOptions) => {
      try {
        const config = loadConfig();
        validateConfig(config);

        const body: Record<string, string> = {};
        if (options.title) body.title = options.title;
        if (options.description) body.description = options.description;
        if (options.type) body.type = options.type;

        if (Object.keys(body).length === 0) {
          console.error(
            'Error: At least one update option is required (--title, --description, or --type).'
          );
          process.exitCode = 1;
          return;
        }

        const response = await fetch(specsUrl(config, id), {
          method: 'PATCH',
          headers: getApiHeaders(config),
          body: JSON.stringify(body),
        });

        const result = await handleResponse<{ data: SpecNode }>(response);

        console.log(`Specification "${id}" updated successfully.`);
        console.log(formatOutput(result.data, config.defaultFormat));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error updating spec "${id}": ${message}`);
        process.exitCode = 1;
      }
    });
}

/**
 * Creates the `delete` subcommand for deleting a spec.
 */
function createDeleteSubcommand(): Command {
  return new Command('delete')
    .description('Delete a specification')
    .argument('<id>', 'Specification ID')
    .option('--force', 'Skip confirmation prompt')
    .action(async (id: string, options: DeleteOptions) => {
      try {
        const config = loadConfig();
        validateConfig(config);

        if (!options.force) {
          const readline = await import('node:readline');
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
          });

          const confirmed = await new Promise<boolean>((resolve) => {
            rl.question(
              `Are you sure you want to delete spec "${id}"? (y/N): `,
              (answer) => {
                rl.close();
                resolve(
                  answer.trim().toLowerCase() === 'y' ||
                    answer.trim().toLowerCase() === 'yes'
                );
              }
            );
          });

          if (!confirmed) {
            console.log('Delete cancelled.');
            return;
          }
        }

        const response = await fetch(specsUrl(config, id), {
          method: 'DELETE',
          headers: getApiHeaders(config),
        });

        await handleResponse<{ message: string }>(response);
        console.log(`Specification "${id}" deleted successfully.`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error deleting spec "${id}": ${message}`);
        process.exitCode = 1;
      }
    });
}

/**
 * Creates and returns the `spectree spec` command with all CRUD subcommands.
 */
export function createSpecCommand(): Command {
  const cmd = new Command('spec')
    .description('Manage specifications')
    .addCommand(createListSubcommand())
    .addCommand(createGetSubcommand())
    .addCommand(createCreateSubcommand())
    .addCommand(createUpdateSubcommand())
    .addCommand(createDeleteSubcommand());

  return cmd;
}
