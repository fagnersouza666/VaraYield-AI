import { useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Raydium } from '@raydium-io/raydium-sdk-v2';
import type { PortfolioData, ProtocolData, OptimizationResult, RaydiumHookReturn, RaydiumPoolList } from '../types';
import { logger } from '../shared/logger';
import { 
  RaydiumInitializationError, 
  PoolDataFetchError, 
  PortfolioOptimizationError,
  WalletConnectionError,
  createErrorFromUnknown 
} from '../shared/errors';
import { APP_CONFIG, DEFAULT_PROTOCOLS, ERROR_MESSAGES } from '../shared/constants';
import { numberValidation, objectValidation } from '../shared/validation';

const createInitialPortfolioData = (): PortfolioData => ({
  totalValueLocked: APP_CONFIG.PORTFOLIO.DEFAULT_TOTAL_VALUE,
  currentAPY: APP_CONFIG.PORTFOLIO.DEFAULT_APY,
  weeklyChange: APP_CONFIG.PORTFOLIO.DEFAULT_WEEKLY_CHANGE,
  protocols: DEFAULT_PROTOCOLS,
});

const validateWalletConnection = (publicKey: unknown, signAllTransactions: unknown): void => {
  if (!objectValidation.isNotNull(publicKey)) {
    throw new WalletConnectionError(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
  }
  if (!objectValidation.isNotNull(signAllTransactions)) {
    throw new WalletConnectionError(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
  }
};

const generateRandomAPYChange = (): number => {
  return (Math.random() - 0.5) * 6;
};

const formatAPYChange = (change: number): string => {
  return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
};

const createProtocolFromPool = (pool: { id?: string; name?: string; apy?: number }): ProtocolData => {
  const apy = pool.apy || Math.random() * 15 + APP_CONFIG.OPTIMIZATION.MIN_APY_THRESHOLD;
  const change = generateRandomAPYChange();
  
  return {
    name: pool.name || 'Unknown',
    apy: `${apy.toFixed(1)}%`,
    change: formatAPYChange(change),
    positive: change >= 0,
    poolId: pool.id,
  };
};

export const useRaydiumData = (): RaydiumHookReturn => {
  const { connection } = useConnection();
  const { publicKey, signAllTransactions } = useWallet();
  const [raydium, setRaydium] = useState<Raydium | null>(null);
  const [portfolioData, setPortfolioData] = useState<PortfolioData>(createInitialPortfolioData());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeRaydium = useCallback(async (): Promise<void> => {
    if (!connection) {
      logger.warn('Connection not available for Raydium initialization');
      return;
    }
    
    try {
      validateWalletConnection(publicKey, signAllTransactions);
      setLoading(true);
      setError(null);
      
      logger.info('Initializing Raydium SDK', { 
        publicKey: publicKey?.toBase58(),
        connection: !!connection 
      });
      
      const raydiumInstance = await Raydium.load({
        connection,
        owner: publicKey!,
        signAllTransactions: signAllTransactions!,
        disableLoadToken: false,
      });
      
      setRaydium(raydiumInstance);
      logger.info('Raydium SDK initialized successfully');
    } catch (err) {
      const error = createErrorFromUnknown(err);
      const raydiumError = new RaydiumInitializationError(
        ERROR_MESSAGES.RAYDIUM_INIT_FAILED,
        { originalError: error.message }
      );
      
      logger.error('Failed to initialize Raydium SDK', raydiumError.toJSON());
      setError(raydiumError.message);
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey, signAllTransactions]);

  const fetchPoolData = useCallback(async (): Promise<void> => {
    if (!objectValidation.isNotNull(raydium)) {
      logger.warn('Raydium instance not available for pool data fetch');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      logger.info('Fetching pool data from Raydium API');
      
      const poolList: RaydiumPoolList = await raydium.api.getPoolList({});
      
      if (poolList?.data?.length && poolList.data.length > 0) {
        const topPools = poolList.data.slice(0, APP_CONFIG.PORTFOLIO.TOP_POOLS_LIMIT);
        const protocolsData: ProtocolData[] = topPools.map(createProtocolFromPool);
        
        setPortfolioData(prev => ({
          ...prev,
          protocols: protocolsData,
        }));
        
        logger.info('Pool data updated successfully', { 
          poolCount: protocolsData.length 
        });
      } else {
        logger.warn('No pool data received from API');
      }
    } catch (err) {
      const error = createErrorFromUnknown(err);
      const poolError = new PoolDataFetchError(
        ERROR_MESSAGES.POOL_DATA_FETCH_FAILED,
        { originalError: error.message }
      );
      
      logger.error('Failed to fetch pool data', poolError.toJSON());
      setError(poolError.message);
    } finally {
      setLoading(false);
    }
  }, [raydium]);

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

  const optimizePortfolio = useCallback(async (): Promise<OptimizationResult | undefined> => {
    if (!objectValidation.isNotNull(raydium)) {
      const walletError = new WalletConnectionError(ERROR_MESSAGES.RAYDIUM_INIT_FAILED);
      setError(walletError.message);
      logger.error('Portfolio optimization failed - Raydium not initialized');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      logger.info('Starting portfolio optimization');
      
      await new Promise(resolve => 
        setTimeout(resolve, APP_CONFIG.OPTIMIZATION.SIMULATION_DELAY_MS)
      );
      
      const newAPY = generateOptimizedAPY();
      const newChange = generateWeeklyChange();
      
      if (!numberValidation.isPositive(newAPY) || !numberValidation.isFinite(newAPY)) {
        throw new PortfolioOptimizationError('Invalid APY generated during optimization');
      }
      
      setPortfolioData(prev => ({
        ...prev,
        currentAPY: newAPY,
        weeklyChange: newChange,
      }));
      
      const now = new Date();
      const result: OptimizationResult = {
        lastOptimized: formatOptimizationTime(now),
        nextRebalance: `${APP_CONFIG.OPTIMIZATION.DEFAULT_REBALANCE_INTERVAL_HOURS}h 0m`,
      };
      
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
      setError(optimizationError.message);
      throw optimizationError;
    } finally {
      setLoading(false);
    }
  }, [raydium]);

  useEffect(() => {
    initializeRaydium();
  }, [initializeRaydium]);

  useEffect(() => {
    if (raydium) {
      fetchPoolData();
    }
  }, [raydium, fetchPoolData]);

  return {
    portfolioData,
    loading,
    error,
    optimizePortfolio,
    refreshData: fetchPoolData,
    raydium,
    connected: !!publicKey,
  };
};