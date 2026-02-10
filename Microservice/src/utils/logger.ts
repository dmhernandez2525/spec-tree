type LogLevel = 'info' | 'warn' | 'error';

type LogContext = Record<string, unknown>;

const formatLog = (
  level: LogLevel,
  scope: string,
  message: string,
  context?: LogContext
) => {
  const payload: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    level,
    scope,
    message,
  };

  if (context) {
    Object.assign(payload, context);
  }

  return JSON.stringify(payload);
};

const writeLine = (stream: NodeJS.WriteStream, line: string) => {
  stream.write(`${line}\n`);
};

export const logger = {
  info: (scope: string, message: string, context?: LogContext) => {
    writeLine(process.stdout, formatLog('info', scope, message, context));
  },
  warn: (scope: string, message: string, context?: LogContext) => {
    writeLine(process.stdout, formatLog('warn', scope, message, context));
  },
  error: (scope: string, message: string, context?: LogContext) => {
    writeLine(process.stderr, formatLog('error', scope, message, context));
  },
};
