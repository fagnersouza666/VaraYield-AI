import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Raydium } from '@raydium-io/raydium-sdk-v2';
import type { PortfolioData, RaydiumHookReturn } from '../types';
import { APP_CONFIG, DEFAULT_PROTOCOLS } from '../shared/constants';
import { numberValidation } from '../shared/validation';
import { useRaydiumInitialization } from './useRaydiumInitialization';
import { usePoolDataFetcher } from './usePoolDataFetcher';
import { usePortfolioOptimizer } from './usePortfolioOptimizer';

const createInitialPortfolioData = (): PortfolioData => ({
  totalValueLocked: APP_CONFIG.PORTFOLIO.DEFAULT_TOTAL_VALUE,
  currentAPY: APP_CONFIG.PORTFOLIO.DEFAULT_APY,
  weeklyChange: APP_CONFIG.PORTFOLIO.DEFAULT_WEEKLY_CHANGE,
  protocols: DEFAULT_PROTOCOLS,
});

export const useRaydiumData = (): RaydiumHookReturn => {
  const { publicKey } = useWallet();
  const [raydium, setRaydium] = useState<Raydium | null>(null);
  const [portfolioData, setPortfolioData] = useState<PortfolioData>(createInitialPortfolioData());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { initializeRaydium } = useRaydiumInitialization();
  const { fetchPoolData } = usePoolDataFetcher();
  const { optimizePortfolio: performOptimization } = usePortfolioOptimizer();

  const handleRaydiumInitialization = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const raydiumInstance = await initializeRaydium();
      if (raydiumInstance) {
        setRaydium(raydiumInstance);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [initializeRaydium]);

  const handlePoolDataFetch = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const protocolsData = await fetchPoolData(raydium);
      
      setPortfolioData(prev => ({
        ...prev,
        protocols: protocolsData,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchPoolData, raydium]);

  const optimizePortfolio = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await performOptimization(raydium);
      
      // Update portfolio data after optimization  
      const newAPY = Math.random() * 5 + APP_CONFIG.OPTIMIZATION.MIN_APY_THRESHOLD;
      const newChange = Math.random() * 3 + 1;
      
      // Validate generated values
      if (!numberValidation.isFinite(newAPY) || !numberValidation.isPositive(newAPY)) {
        throw new Error('Invalid APY calculated during optimization');
      }
      if (!numberValidation.isFinite(newChange)) {
        throw new Error('Invalid change value calculated during optimization');
      }
      
      setPortfolioData(prev => ({
        ...prev,
        currentAPY: newAPY,
        weeklyChange: newChange,
      }));
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRaydiumInitialization();
  }, [handleRaydiumInitialization, publicKey]);

  useEffect(() => {
    if (raydium) {
      handlePoolDataFetch();
    }
  }, [handlePoolDataFetch, raydium]);

  return {
    portfolioData,
    loading,
    error,
    optimizePortfolio,
    refreshData: handlePoolDataFetch,
    raydium,
    connected: !!publicKey,
  };
};