// SpecTree CLI - Watch Command (F3.1.4)

import { Command } from 'commander';
import * as fs from 'node:fs';
import * as path from 'node:path';

/** File extensions that are monitored for changes. */
const WATCHED_EXTENSIONS = new Set(['.json', '.yaml', '.yml', '.md']);

interface WatchOptions {
  dir?: string;
  debounce?: string;
}

/**
 * Determines whether a filename has a watched extension.
 */
function isWatchedFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return WATCHED_EXTENSIONS.has(ext);
}

/**
 * Returns a debounced version of the given callback. The callback
 * will only execute after the specified delay has elapsed without
 * another invocation.
 */
function debounce(fn: (...args: unknown[]) => void, delayMs: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return (...args: unknown[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, delayMs);
  };
}

/**
 * Creates and returns the `spectree watch` command.
 * Watches a directory for changes to spec files (.json, .yaml, .md)
 * and logs detected events. Stops on SIGINT (Ctrl+C).
 */
export function createWatchCommand(): Command {
  const cmd = new Command('watch')
    .description('Watch for specification changes')
    .option('--dir <directory>', 'Directory to watch', '.')
    .option('--debounce <ms>', 'Debounce interval in milliseconds', '300')
    .action((options: WatchOptions) => {
      const watchDir = path.resolve(options.dir || '.');
      const debounceMs = parseInt(options.debounce || '300', 10);

      if (!fs.existsSync(watchDir)) {
        console.error(`Error: Directory "${watchDir}" does not exist.`);
        process.exitCode = 1;
        return;
      }

      if (!fs.statSync(watchDir).isDirectory()) {
        console.error(`Error: "${watchDir}" is not a directory.`);
        process.exitCode = 1;
        return;
      }

      console.log(`Watching ${watchDir} for changes...`);
      console.log('Press Ctrl+C to stop.');
      console.log('');

      const handleChange = debounce(
        (eventType: unknown, filename: unknown) => {
          if (typeof filename !== 'string') return;
          if (!isWatchedFile(filename)) return;

          const fullPath = path.join(watchDir, filename);
          const timestamp = new Date().toISOString();
          const exists = fs.existsSync(fullPath);
          const changeType = exists ? eventType : 'delete';

          console.log(`[${timestamp}] ${changeType}: ${filename}`);
        },
        debounceMs
      );

      const watcher = fs.watch(watchDir, { recursive: false }, (eventType, filename) => {
        handleChange(eventType, filename);
      });

      // Graceful shutdown on SIGINT
      const cleanup = () => {
        console.log('');
        console.log('Stopping file watcher...');
        watcher.close();
        process.exit(0);
      };

      process.on('SIGINT', cleanup);
      process.on('SIGTERM', cleanup);
    });

  return cmd;
}
