import { useCallback } from 'react';
import type { ProtocolData, RaydiumPoolList } from '../types';
import type { RaydiumInstance } from '../types/raydium';
import { logger } from '../shared/logger';
import { PoolDataFetchError, createErrorFromUnknown } from '../shared/errors';
import { APP_CONFIG, ERROR_MESSAGES } from '../shared/constants';
import { objectValidation } from '../shared/validation';

interface UsePoolDataFetcherReturn {
  fetchPoolData: (raydium: RaydiumInstance) => Promise<ProtocolData[]>;
}

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

const fetchRaydiumPoolList = async (raydium: RaydiumInstance): Promise<RaydiumPoolList> => {
  return await raydium.api.getPoolList({});
};

const validatePoolListData = (poolList: RaydiumPoolList): boolean => {
  return poolList?.data?.length && poolList.data.length > 0;
};

export const usePoolDataFetcher = (): UsePoolDataFetcherReturn => {
  const fetchPoolData = useCallback(async (raydium: RaydiumInstance): Promise<ProtocolData[]> => {
    if (!objectValidation.isNotNull(raydium)) {
      logger.warn('Raydium instance not available for pool data fetch');
      return [];
    }
    
    try {
      logger.info('Fetching pool data from Raydium API');
      
      const poolList = await fetchRaydiumPoolList(raydium);
      
      if (!validatePoolListData(poolList)) {
        logger.warn('No pool data received from API');
        return [];
      }
      
      const topPools = poolList.data!.slice(0, APP_CONFIG.PORTFOLIO.TOP_POOLS_LIMIT);
      const protocolsData = topPools.map(createProtocolFromPool);
      
      logger.info('Pool data updated successfully', { 
        poolCount: protocolsData.length 
      });
      
      return protocolsData;
    } catch (err) {
      const error = createErrorFromUnknown(err);
      const poolError = new PoolDataFetchError(
        ERROR_MESSAGES.POOL_DATA_FETCH_FAILED,
        { originalError: error.message }
      );
      
      logger.error('Failed to fetch pool data', poolError.toJSON());
      throw poolError;
    }
  }, []);

  return { fetchPoolData };
};