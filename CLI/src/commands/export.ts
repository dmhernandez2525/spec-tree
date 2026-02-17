// SpecTree CLI - Export Command (F3.1.4)

import { Command } from 'commander';
import { CliConfig, CliError, SpecNode, ApiResponse, OutputFormat } from '../types';
import { loadConfig, getApiHeaders, validateConfig } from '../config';
import { formatOutput, writeOutput } from '../formatters';

interface ExportCommandOptions {
  format?: OutputFormat;
  output?: string;
  type?: string;
  includeMetadata?: boolean;
  pretty?: boolean;
}

/**
 * Fetches all specifications from the API, optionally filtered by type.
 * Paginates through all pages to collect every spec.
 */
async function fetchAllSpecs(
  config: CliConfig,
  typeFilter?: string
): Promise<SpecNode[]> {
  const allSpecs: SpecNode[] = [];
  let currentPage = 1;
  let totalPages = 1;

  while (currentPage <= totalPages) {
    const params = new URLSearchParams();
    params.set('page', String(currentPage));
    params.set('pageSize', '100');
    if (typeFilter) params.set('type', typeFilter);

    const url = `${config.apiUrl}/specs?${params.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getApiHeaders(config),
    });

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

    const result = (await response.json()) as ApiResponse<SpecNode[]>;
    allSpecs.push(...result.data);
    totalPages = result.meta.pagination.pageCount;
    currentPage++;
  }

  return allSpecs;
}

/**
 * Strips the metadata field from each spec node if includeMetadata is false.
 */
function stripMetadata(specs: SpecNode[]): Omit<SpecNode, 'metadata'>[] {
  return specs.map(({ metadata: _metadata, ...rest }) => rest);
}

/**
 * Creates and returns the `spectree export` command.
 * Exports specifications to a file or stdout in the chosen format.
 */
export function createExportCommand(): Command {
  const cmd = new Command('export')
    .description('Export specifications')
    .option(
      '--format <format>',
      'Output format (json, yaml, markdown, csv)'
    )
    .option('-o, --output <path>', 'Output file path (defaults to stdout)')
    .option('--type <type>', 'Filter by spec type (epic, feature, user-story, task)')
    .option('--include-metadata', 'Include metadata fields in the export')
    .option('--pretty', 'Pretty-print the output')
    .action(async (options: ExportCommandOptions) => {
      try {
        const config = loadConfig();
        validateConfig(config);

        const format = options.format || config.defaultFormat;
        const specs = await fetchAllSpecs(config, options.type);

        const dataToExport = options.includeMetadata
          ? specs
          : stripMetadata(specs);

        const formatted = formatOutput(dataToExport, format, {
          prettyPrint: options.pretty,
        });

        const destination = options.output || undefined;
        writeOutput(formatted, destination);

        const target = destination || 'stdout';
        console.log(`Exported ${specs.length} specifications to ${target}`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error exporting specs: ${message}`);
        process.exitCode = 1;
      }
    });

  return cmd;
}
