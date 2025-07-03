/**
 * Safe Raydium Service
 * Provides error-safe wrappers for Raydium SDK operations
 */

import { solanaErrorHandler } from '../utils/solana-error-handler';
import { errorLogger } from './error-logger.service';

export interface SafeRaydiumConfig {
  enableFallbacks: boolean;
  maxRetries: number;
  retryDelay: number;
}

export class SafeRaydiumService {
  private static instance: SafeRaydiumService;
  private config: SafeRaydiumConfig = {
    enableFallbacks: true,
    maxRetries: 2,
    retryDelay: 1000
  };

  static getInstance(): SafeRaydiumService {
    if (!SafeRaydiumService.instance) {
      SafeRaydiumService.instance = new SafeRaydiumService();
    }
    return SafeRaydiumService.instance;
  }

  /**
   * Safe wrapper for any Raydium SDK function that might throw account errors
   */
  async safeExecute<T>(
    operation: () => Promise<T>,
    fallbackValue: T,
    operationName: string,
    retries: number = this.config.maxRetries
  ): Promise<T> {
    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        console.log(`🔄 Executing ${operationName} (attempt ${attempt}/${retries + 1})`);
        
        const result = await operation();
        
        if (attempt > 1) {
          console.log(`✅ ${operationName} succeeded on retry attempt ${attempt}`);
        }
        
        return result;
        
      } catch (error) {
        console.warn(`⚠️ ${operationName} failed on attempt ${attempt}:`, error);
        
        // Check if it's a Solana account error
        const wasSolanaError = solanaErrorHandler.handleAccountDataError(error, {
          operationName,
          attempt,
          maxRetries: retries
        });
        
        if (wasSolanaError) {
          if (this.config.enableFallbacks) {
            console.warn(`🔄 Using fallback for ${operationName} due to account data error`);
            
            errorLogger.logWarning({
              category: 'PARSING_ERROR',
              message: `${operationName} failed with account data error, using fallback`,
              details: {
                error: error.message,
                attempt,
                maxRetries: retries,
                fallbackUsed: true
              },
              context: {
                component: 'SafeRaydiumService',
                operation: operationName
              }
            });
            
            return fallbackValue;
          }
        }
        
        // If it's the last attempt or not a Solana error, decide what to do
        if (attempt === retries + 1) {
          if (this.config.enableFallbacks) {
            console.error(`❌ ${operationName} failed after ${retries + 1} attempts, using fallback`);
            
            errorLogger.logError({
              category: 'API_ERROR',
              message: `${operationName} failed after all retries, using fallback`,
              details: {
                error: error.message,
                totalAttempts: retries + 1,
                fallbackUsed: true
              },
              context: {
                component: 'SafeRaydiumService',
                operation: operationName
              }
            });
            
            return fallbackValue;
          } else {
            throw error;
          }
        }
        
        // Wait before retry
        if (attempt <= retries) {
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * attempt));
        }
      }
    }
    
    return fallbackValue; // Should never reach here
  }

  /**
   * Safe synchronous wrapper
   */
  safeExecuteSync<T>(
    operation: () => T,
    fallbackValue: T,
    operationName: string
  ): T {
    try {
      return operation();
    } catch (error) {
      const wasSolanaError = solanaErrorHandler.handleAccountDataError(error, { operationName });
      
      if (wasSolanaError || this.config.enableFallbacks) {
        console.warn(`⚠️ ${operationName} failed, using fallback:`, error);
        return fallbackValue;
      }
      
      throw error;
    }
  }

  /**
   * Safe account data parsing
   */
  safeParseAccountData<T>(
    parseFunction: () => T,
    fallbackData: T,
    accountType: string
  ): T {
    return this.safeExecuteSync(
      parseFunction,
      fallbackData,
      `parseAccountData(${accountType})`
    );
  }

  /**
   * Safe pool data fetching
   */
  async safeGetPoolData(
    getPoolFunction: () => Promise<any>,
    poolId: string
  ): Promise<any> {
    const fallbackPool = {
      id: poolId,
      name: 'Unknown Pool',
      apy: 0,
      tvl: 0,
      volume24h: 0,
      available: false,
      error: 'Account data error - using fallback'
    };

    return this.safeExecute(
      getPoolFunction,
      fallbackPool,
      `getPoolData(${poolId})`
    );
  }

  /**
   * Safe token price fetching
   */
  async safeGetTokenPrice(
    getPriceFunction: () => Promise<number>,
    tokenSymbol: string
  ): Promise<number> {
    return this.safeExecute(
      getPriceFunction,
      0,
      `getTokenPrice(${tokenSymbol})`
    );
  }

  /**
   * Configuration methods
   */
  enableFallbacks(enable: boolean = true): void {
    this.config.enableFallbacks = enable;
    console.log(`🔧 SafeRaydiumService fallbacks ${enable ? 'enabled' : 'disabled'}`);
  }

  setRetryConfig(maxRetries: number, retryDelay: number): void {
    this.config.maxRetries = maxRetries;
    this.config.retryDelay = retryDelay;
    console.log(`🔧 SafeRaydiumService retry config: ${maxRetries} retries, ${retryDelay}ms delay`);
  }

  getConfig(): SafeRaydiumConfig {
    return { ...this.config };
  }
}

// Export singleton
export const safeRaydiumService = SafeRaydiumService.getInstance();

// Convenience functions
export const safeRaydiumExecute = <T>(
  operation: () => Promise<T>,
  fallback: T,
  name: string
): Promise<T> => {
  return safeRaydiumService.safeExecute(operation, fallback, name);
};

export const safeRaydiumExecuteSync = <T>(
  operation: () => T,
  fallback: T,
  name: string
): T => {
  return safeRaydiumService.safeExecuteSync(operation, fallback, name);
};