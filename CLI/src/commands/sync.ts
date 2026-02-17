// SpecTree CLI - Sync Command (F3.1.4)

import { Command } from 'commander';
import { CliError, SyncDirection, SyncResult } from '../types';
import { loadConfig, getApiHeaders, validateConfig } from '../config';

interface SyncOptions {
  direction?: SyncDirection;
  dryRun?: boolean;
  force?: boolean;
}

/**
 * Prints a summary of the sync operation results, including counts
 * for created, updated, and deleted specs and any conflicts.
 */
function printSyncSummary(result: SyncResult, isDryRun: boolean): void {
  const prefix = isDryRun ? '[DRY RUN] ' : '';

  console.log('');
  console.log(`${prefix}Sync complete (direction: ${result.direction})`);
  console.log(`  Created: ${result.created}`);
  console.log(`  Updated: ${result.updated}`);
  console.log(`  Deleted: ${result.deleted}`);

  if (result.conflicts.length > 0) {
    console.log(`  Conflicts: ${result.conflicts.length}`);
    console.log('');
    console.log('Conflict details:');
    for (const conflict of result.conflicts) {
      const resolution = conflict.resolution || 'unresolved';
      console.log(`  - Node ${conflict.nodeId}: ${resolution}`);
      console.log(`    Local title:  "${conflict.localVersion.title}"`);
      console.log(`    Remote title: "${conflict.remoteVersion.title}"`);
    }
  }

  if (isDryRun) {
    console.log('');
    console.log(
      'This was a dry run. No changes were applied. Remove --dry-run to apply.'
    );
  }
}

/**
 * Creates and returns the `spectree sync` command.
 * Syncs local specifications with the remote server.
 */
export function createSyncCommand(): Command {
  const cmd = new Command('sync')
    .description('Sync specifications with remote')
    .option(
      '--direction <direction>',
      'Sync direction (push, pull, both)',
      'both'
    )
    .option('--dry-run', 'Preview changes without applying them')
    .option('--force', 'Force sync, overwriting conflicts with local changes')
    .action(async (options: SyncOptions) => {
      try {
        const config = loadConfig();
        validateConfig(config);

        const direction = options.direction || 'both';
        const dryRun = options.dryRun || false;
        const force = options.force || false;

        console.log(
          `Syncing specifications (direction: ${direction}, dry-run: ${dryRun}, force: ${force})...`
        );

        const body = {
          direction,
          dryRun,
          force,
        };

        const response = await fetch(`${config.apiUrl}/sync`, {
          method: 'POST',
          headers: getApiHeaders(config),
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          let detail = '';
          try {
            const errorBody = await response.json();
            detail = errorBody.message || errorBody.error || JSON.stringify(errorBody);
          } catch {
            detail = response.statusText;
          }
          throw new CliError(
            `Sync failed (${response.status}): ${detail}`,
            'SYNC_ERROR',
            response.status
          );
        }

        const result = (await response.json()) as { data: SyncResult };
        printSyncSummary(result.data, dryRun);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error during sync: ${message}`);
        process.exitCode = 1;
      }
    });

  return cmd;
}
