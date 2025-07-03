/**
 * Centralized Error Logging Service for VaraYield AI
 * 
 * Provides unified error collection, categorization, and reporting
 * for both development and production environments.
 */

export interface ErrorLog {
  id: string;
  timestamp: number;
  level: 'error' | 'warn' | 'info' | 'debug';
  category: ErrorCategory;
  message: string;
  details?: any;
  context?: {
    component?: string;
    walletAddress?: string;
    rpcEndpoint?: string;
    userAgent?: string;
    url?: string;
  };
  stack?: string;
  resolved?: boolean;
}

export type ErrorCategory = 
  | 'RPC_ERROR'
  | 'WALLET_ERROR' 
  | 'NETWORK_ERROR'
  | 'API_ERROR'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMIT'
  | 'TIMEOUT'
  | 'PARSING_ERROR'
  | 'UNKNOWN_ERROR';

export class ErrorLoggerService {
  private static instance: ErrorLoggerService;
  private logs: ErrorLog[] = [];
  private maxLogs = 1000; // Keep last 1000 logs
  private subscribers: ((log: ErrorLog) => void)[] = [];

  private constructor() {
    this.setupGlobalErrorHandlers();
  }

  static getInstance(): ErrorLoggerService {
    if (!ErrorLoggerService.instance) {
      ErrorLoggerService.instance = new ErrorLoggerService();
    }
    return ErrorLoggerService.instance;
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        category: 'UNKNOWN_ERROR',
        message: 'Unhandled Promise Rejection',
        details: event.reason,
        context: {
          url: window.location.href,
          userAgent: navigator.userAgent,
        }
      });
    });

    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError({
        category: 'UNKNOWN_ERROR',
        message: event.message,
        details: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
        stack: event.error?.stack,
        context: {
          url: window.location.href,
          userAgent: navigator.userAgent,
        }
      });
    });
  }

  /**
   * Log an error with automatic categorization
   */
  logError(params: {
    category?: ErrorCategory;
    message: string;
    details?: any;
    context?: ErrorLog['context'];
    stack?: string;
    component?: string;
  }): void {
    const log: ErrorLog = {
      id: this.generateId(),
      timestamp: Date.now(),
      level: 'error',
      category: params.category || this.categorizeError(params.message),
      message: params.message,
      details: params.details,
      context: {
        ...params.context,
        component: params.component,
        url: window.location.href,
        userAgent: navigator.userAgent,
      },
      stack: params.stack,
      resolved: false,
    };

    this.addLog(log);
    
    // Console output with emoji for better visibility
    console.error(`❌ [${log.category}] ${log.message}`, log.details);
  }

  /**
   * Log a warning
   */
  logWarning(params: {
    category?: ErrorCategory;
    message: string;
    details?: any;
    context?: ErrorLog['context'];
    component?: string;
  }): void {
    const log: ErrorLog = {
      id: this.generateId(),
      timestamp: Date.now(),
      level: 'warn',
      category: params.category || this.categorizeError(params.message),
      message: params.message,
      details: params.details,
      context: {
        ...params.context,
        component: params.component,
        url: window.location.href,
      },
      resolved: false,
    };

    this.addLog(log);
    console.warn(`⚠️ [${log.category}] ${log.message}`, log.details);
  }

  /**
   * Log info message
   */
  logInfo(params: {
    category?: ErrorCategory;
    message: string;
    details?: any;
    context?: ErrorLog['context'];
    component?: string;
  }): void {
    const log: ErrorLog = {
      id: this.generateId(),
      timestamp: Date.now(),
      level: 'info',
      category: params.category || 'UNKNOWN_ERROR',
      message: params.message,
      details: params.details,
      context: {
        ...params.context,
        component: params.component,
      },
      resolved: false,
    };

    this.addLog(log);
    console.info(`ℹ️ [${log.category}] ${log.message}`, log.details);
  }

  /**
   * Log debug message (only in development)
   */
  logDebug(params: {
    message: string;
    details?: any;
    component?: string;
  }): void {
    if (import.meta.env.DEV) {
      const log: ErrorLog = {
        id: this.generateId(),
        timestamp: Date.now(),
        level: 'debug',
        category: 'UNKNOWN_ERROR',
        message: params.message,
        details: params.details,
        context: {
          component: params.component,
        },
        resolved: false,
      };

      this.addLog(log);
      console.debug(`🐛 [DEBUG] ${log.message}`, log.details);
    }
  }

  /**
   * Automatically categorize errors based on message content
   */
  private categorizeError(message: string): ErrorCategory {
    const msg = message.toLowerCase();
    
    if (msg.includes('buffer is not defined') || msg.includes('buffer') || msg.includes('polyfill')) {
      return 'PARSING_ERROR'; // Buffer issues are usually parsing/compatibility problems
    }
    if (msg.includes('rpc') || msg.includes('endpoint') || msg.includes('connection')) {
      return 'RPC_ERROR';
    }
    if (msg.includes('wallet') || msg.includes('phantom') || msg.includes('solflare')) {
      return 'WALLET_ERROR';
    }
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('request')) {
      return 'NETWORK_ERROR';
    }
    if (msg.includes('rate limit') || msg.includes('429') || msg.includes('403')) {
      return 'RATE_LIMIT';
    }
    if (msg.includes('timeout') || msg.includes('timed out')) {
      return 'TIMEOUT';
    }
    if (msg.includes('parse') || msg.includes('json') || msg.includes('invalid')) {
      return 'PARSING_ERROR';
    }
    if (msg.includes('validation') || msg.includes('required') || msg.includes('invalid')) {
      return 'VALIDATION_ERROR';
    }
    if (msg.includes('api') || msg.includes('400') || msg.includes('500')) {
      return 'API_ERROR';
    }
    
    return 'UNKNOWN_ERROR';
  }

  /**
   * Add log to collection and notify subscribers
   */
  private addLog(log: ErrorLog): void {
    this.logs.unshift(log); // Add to beginning (newest first)
    
    // Keep only the last N logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Notify subscribers
    this.subscribers.forEach(callback => {
      try {
        callback(log);
      } catch (error) {
        console.error('Error in log subscriber:', error);
      }
    });
  }

  /**
   * Subscribe to new logs
   */
  subscribe(callback: (log: ErrorLog) => void): () => void {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Get all logs with optional filtering
   */
  getLogs(filters?: {
    level?: ErrorLog['level'];
    category?: ErrorCategory;
    resolved?: boolean;
    since?: number; // timestamp
    limit?: number;
  }): ErrorLog[] {
    let filteredLogs = this.logs;

    if (filters) {
      if (filters.level) {
        filteredLogs = filteredLogs.filter(log => log.level === filters.level);
      }
      if (filters.category) {
        filteredLogs = filteredLogs.filter(log => log.category === filters.category);
      }
      if (filters.resolved !== undefined) {
        filteredLogs = filteredLogs.filter(log => log.resolved === filters.resolved);
      }
      if (filters.since) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.since!);
      }
      if (filters.limit) {
        filteredLogs = filteredLogs.slice(0, filters.limit);
      }
    }

    return filteredLogs;
  }

  /**
   * Mark error as resolved
   */
  resolveError(id: string): void {
    const log = this.logs.find(l => l.id === id);
    if (log) {
      log.resolved = true;
    }
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Get error statistics
   */
  getStats(): {
    total: number;
    byLevel: Record<ErrorLog['level'], number>;
    byCategory: Record<ErrorCategory, number>;
    resolved: number;
    recent: number; // last hour
  } {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    const stats = {
      total: this.logs.length,
      byLevel: {
        error: 0,
        warn: 0,
        info: 0,
        debug: 0,
      } as Record<ErrorLog['level'], number>,
      byCategory: {} as Record<ErrorCategory, number>,
      resolved: 0,
      recent: 0,
    };

    this.logs.forEach(log => {
      stats.byLevel[log.level]++;
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
      
      if (log.resolved) {
        stats.resolved++;
      }
      
      if (log.timestamp >= oneHourAgo) {
        stats.recent++;
      }
    });

    return stats;
  }

  /**
   * Export logs for debugging
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Generate unique ID for logs
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// Global instance
export const errorLogger = ErrorLoggerService.getInstance();

// Convenience functions
export const logError = (message: string, details?: any, component?: string) => {
  errorLogger.logError({ message, details, component });
};

export const logWarning = (message: string, details?: any, component?: string) => {
  errorLogger.logWarning({ message, details, component });
};

export const logInfo = (message: string, details?: any, component?: string) => {
  errorLogger.logInfo({ message, details, component });
};

export const logDebug = (message: string, details?: any, component?: string) => {
  errorLogger.logDebug({ message, details, component });
};

// Helper to log RPC errors specifically
export const logRPCError = (endpoint: string, error: any, context?: any) => {
  errorLogger.logError({
    category: 'RPC_ERROR',
    message: `RPC Error: ${error.message || error}`,
    details: error,
    context: {
      rpcEndpoint: endpoint,
      ...context,
    },
    component: 'RPC',
  });
};

// Helper to log wallet errors
export const logWalletError = (walletName: string, error: any, context?: any) => {
  errorLogger.logError({
    category: 'WALLET_ERROR',
    message: `Wallet Error (${walletName}): ${error.message || error}`,
    details: error,
    context: context,
    component: 'Wallet',
  });
};