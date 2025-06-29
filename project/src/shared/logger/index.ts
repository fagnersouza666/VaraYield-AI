export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

export interface Logger {
  error(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
}

class ConsoleLogger implements Logger {
  private createLogEntry(level: LogLevel, message: string, context?: Record<string, unknown>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };
  }

  private log(entry: LogEntry): void {
    const logMessage = `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`;
    
    if (entry.context) {
      console.log(logMessage, entry.context);
    } else {
      console.log(logMessage);
    }
  }

  error(message: string, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry(LogLevel.ERROR, message, context);
    this.log(entry);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry(LogLevel.WARN, message, context);
    this.log(entry);
  }

  info(message: string, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, context);
    this.log(entry);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context);
    this.log(entry);
  }
}

export const logger: Logger = new ConsoleLogger();