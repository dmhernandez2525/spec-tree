/**
 * Logger utility for conditional logging
 * Only logs in development environment
 */

const isDev = process.env.NODE_ENV === 'development';

type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug';

interface Logger {
  log: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
}

const createLogger = (): Logger => {
  const createLogFn = (level: LogLevel, alwaysLog = false) => {
    return (...args: unknown[]) => {
      if (alwaysLog || isDev) {
        console[level](...args);
      }
    };
  };

  return {
    log: createLogFn('log'),
    warn: createLogFn('warn'),
    error: createLogFn('error', true), // Always log errors
    info: createLogFn('info'),
    debug: createLogFn('debug'),
  };
};

export const logger = createLogger();

export default logger;
