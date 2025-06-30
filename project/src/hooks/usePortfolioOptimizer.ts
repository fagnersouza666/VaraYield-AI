import { useCallback } from 'react';
import type { OptimizationResult } from '../types';
import type { RaydiumInstance } from '../types/raydium';
import { logger } from '../shared/logger';
import { 
  PortfolioOptimizationError, 
  WalletConnectionError,
  createErrorFromUnknown 
} from '../shared/errors';
import { APP_CONFIG, ERROR_MESSAGES } from '../shared/constants';
import { numberValidation, objectValidation } from '../shared/validation';

interface UsePortfolioOptimizerReturn {
  optimizePortfolio: (raydium: RaydiumInstance) => Promise<OptimizationResult>;
}

const generateOptimizedAPY = (): number => {
  return Math.random() * 5 + APP_CONFIG.OPTIMIZATION.MIN_APY_THRESHOLD;
};

const generateWeeklyChange = (): number => {
  return Math.random() * 3 + 1;
};

const formatOptimizationTime = (date: Date): string => {
  return date.toLocaleString('en-US', {
    timeZone: APP_CONFIG.DATE_TIME.UTC_TIMEZONE,
    ...APP_CONFIG.DATE_TIME.TIME_FORMAT,
  }) + ` ${APP_CONFIG.DATE_TIME.UTC_TIMEZONE}`;
};

const validateOptimizationValues = (apy: number, change: number): void => {
  if (!numberValidation.isPositive(apy) || !numberValidation.isFinite(apy)) {
    throw new PortfolioOptimizationError('Invalid APY generated during optimization');
  }
  if (!numberValidation.isFinite(change)) {
    throw new PortfolioOptimizationError('Invalid change value generated during optimization');
  }
};

const simulateOptimization = async (): Promise<void> => {
  await new Promise(resolve => 
    setTimeout(resolve, APP_CONFIG.OPTIMIZATION.SIMULATION_DELAY_MS)
  );
};

const createOptimizationResult = (): OptimizationResult => {
  const now = new Date();
  return {
    lastOptimized: formatOptimizationTime(now),
    nextRebalance: `${APP_CONFIG.OPTIMIZATION.DEFAULT_REBALANCE_INTERVAL_HOURS}h 0m`,
  };
};

export const usePortfolioOptimizer = (): UsePortfolioOptimizerReturn => {
  const optimizePortfolio = useCallback(async (raydium: RaydiumInstance): Promise<OptimizationResult> => {
    if (!objectValidation.isNotNull(raydium)) {
      const walletError = new WalletConnectionError(ERROR_MESSAGES.RAYDIUM_INIT_FAILED);
      logger.error('Portfolio optimization failed - Raydium not initialized');
      throw walletError;
    }
    
    try {
      logger.info('Starting portfolio optimization');
      
      await simulateOptimization();
      
      const newAPY = generateOptimizedAPY();
      const newChange = generateWeeklyChange();
      
      validateOptimizationValues(newAPY, newChange);
      
      const result = createOptimizationResult();
      
      logger.info('Portfolio optimization completed successfully', {
        newAPY: newAPY.toFixed(2),
        newChange: newChange.toFixed(2),
      });
      
      return result;
    } catch (err) {
      const error = createErrorFromUnknown(err);
      const optimizationError = new PortfolioOptimizationError(
        ERROR_MESSAGES.OPTIMIZATION_FAILED,
        { originalError: error.message }
      );
      
      logger.error('Portfolio optimization failed', optimizationError.toJSON());
      throw optimizationError;
    }
  }, []);

  return { optimizePortfolio };
};