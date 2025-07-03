/**
 * Solana/Raydium Error Handler
 * Handles specific Solana account and deserialization errors
 */

import { errorLogger } from '../services/error-logger.service';

export interface SolanaAccountError {
  type: 'ACCOUNT_DATA_MISMATCH' | 'DESERIALIZATION_ERROR' | 'INVALID_ACCOUNT_TYPE' | 'RPC_ACCOUNT_ERROR';
  expectedType?: number;
  actualType?: number;
  accountAddress?: string;
  originalError?: any;
}

export class SolanaErrorHandler {
  private static instance: SolanaErrorHandler;

  static getInstance(): SolanaErrorHandler {
    if (!SolanaErrorHandler.instance) {
      SolanaErrorHandler.instance = new SolanaErrorHandler();
    }
    return SolanaErrorHandler.instance;
  }

  /**
   * Handle account data mismatch errors from Raydium SDK
   */
  handleAccountDataError(error: any, context?: any): boolean {
    const errorMessage = error?.message || String(error);
    
    // Check if it's an account type mismatch error
    const accountMismatchRegex = /account type mismatch (\d+) != (\d+)/i;
    const match = errorMessage.match(accountMismatchRegex);
    
    if (match) {
      const actualType = parseInt(match[1]);
      const expectedType = parseInt(match[2]);
      
      console.warn('🔍 Account data mismatch detected:', {
        actualType,
        expectedType,
        actualTypeHex: '0x' + actualType.toString(16),
        expectedTypeHex: '0x' + expectedType.toString(16)
      });

      // Log detailed error for debugging
      errorLogger.logError({
        category: 'PARSING_ERROR',
        message: 'Solana account data type mismatch',
        details: {
          actualType,
          expectedType,
          actualTypeHex: '0x' + actualType.toString(16),
          expectedTypeHex: '0x' + expectedType.toString(16),
          errorMessage,
          context
        },
        context: {
          component: 'SolanaErrorHandler',
          operation: 'accountDataDeserialization'
        }
      });

      return true; // Error was handled
    }

    // Check for other common Solana errors
    if (errorMessage.includes('invalid account data')) {
      errorLogger.logError({
        category: 'PARSING_ERROR',
        message: 'Invalid Solana account data',
        details: { errorMessage, context },
        context: {
          component: 'SolanaErrorHandler',
          operation: 'accountDataValidation'
        }
      });
      return true;
    }

    if (errorMessage.includes('deserialize')) {
      errorLogger.logError({
        category: 'PARSING_ERROR',
        message: 'Solana data deserialization failed',
        details: { errorMessage, context },
        context: {
          component: 'SolanaErrorHandler',
          operation: 'dataDeserialization'
        }
      });
      return true;
    }

    return false; // Error not handled
  }

  /**
   * Create a safe wrapper for Raydium SDK operations
   */
  async executeWithFallback<T>(
    operation: () => Promise<T>,
    fallbackValue: T,
    operationName: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const wasHandled = this.handleAccountDataError(error, { operationName });
      
      if (wasHandled) {
        console.warn(`⚠️ ${operationName} failed with account data error, using fallback`);
        return fallbackValue;
      }
      
      // Re-throw if not a known account error
      throw error;
    }
  }

  /**
   * Create a safe wrapper for synchronous Raydium operations
   */
  executeSync<T>(
    operation: () => T,
    fallbackValue: T,
    operationName: string
  ): T {
    try {
      return operation();
    } catch (error) {
      const wasHandled = this.handleAccountDataError(error, { operationName });
      
      if (wasHandled) {
        console.warn(`⚠️ ${operationName} failed with account data error, using fallback`);
        return fallbackValue;
      }
      
      // Re-throw if not a known account error
      throw error;
    }
  }

  /**
   * Analyze account type mismatch and provide suggestions
   */
  analyzeAccountTypeMismatch(actualType: number, expectedType: number): string[] {
    const suggestions: string[] = [];
    
    // Convert to hex for analysis
    const actualHex = '0x' + actualType.toString(16);
    const expectedHex = '0x' + expectedType.toString(16);
    
    // Check if actualType looks like ASCII characters (corrupted data)
    if (actualType > 0x20202020) { // More than 4 space characters
      suggestions.push('Account data appears to be corrupted or contains unexpected ASCII data');
    }
    
    // Check for common Raydium account types
    const knownTypes: Record<number, string> = {
      1: 'Raydium AMM Pool',
      2: 'Raydium LP Token',
      3: 'Raydium Farm',
      4: 'Raydium Staking Pool'
    };
    
    if (knownTypes[expectedType]) {
      suggestions.push(`Expected account type: ${knownTypes[expectedType]} (${expectedHex})`);
    }
    
    if (actualType === 0) {
      suggestions.push('Account appears to be uninitialized or empty');
    }
    
    suggestions.push('Try refreshing RPC connection or using a different endpoint');
    suggestions.push('Account might be from a different program or version');
    
    return suggestions;
  }
}

// Global error handler for Raydium errors
export const handleRaydiumError = (error: any, context?: any): boolean => {
  return SolanaErrorHandler.getInstance().handleAccountDataError(error, context);
};

// Export singleton instance
export const solanaErrorHandler = SolanaErrorHandler.getInstance();