import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRaydiumService } from '../../services/service-provider';
import { 
  PortfolioOptimizationRequest, 
  PortfolioOptimizationResult 
} from '../../services/types/raydium.types';
import { RaydiumError } from '../../utils/errors';

// Query Keys
export const RAYDIUM_QUERY_KEYS = {
  all: ['raydium'] as const,
  pools: () => [...RAYDIUM_QUERY_KEYS.all, 'pools'] as const,
  poolsList: (filters?: Record<string, unknown>) => [...RAYDIUM_QUERY_KEYS.pools(), 'list', filters] as const,
  pool: (id: string) => [...RAYDIUM_QUERY_KEYS.pools(), 'detail', id] as const,
  topPools: (limit?: number) => [...RAYDIUM_QUERY_KEYS.pools(), 'top', limit] as const,
  optimization: () => [...RAYDIUM_QUERY_KEYS.all, 'optimization'] as const,
} as const;

// Hooks for fetching pool data
export const useRaydiumPools = (poolIds?: string[], enabled: boolean = true) => {
  const raydiumService = useRaydiumService();

  return useQuery({
    queryKey: RAYDIUM_QUERY_KEYS.poolsList({ poolIds }),
    queryFn: () => raydiumService.getPoolData(poolIds),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx)
      if (error instanceof RaydiumError && error.statusCode >= 400 && error.statusCode < 500) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useRaydiumPool = (poolId: string, enabled: boolean = true) => {
  const raydiumService = useRaydiumService();

  return useQuery({
    queryKey: RAYDIUM_QUERY_KEYS.pool(poolId),
    queryFn: () => raydiumService.getPoolById(poolId),
    enabled: enabled && !!poolId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof RaydiumError && error.code === 'NOT_FOUND') {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useTopRaydiumPools = (limit: number = 10, enabled: boolean = true) => {
  const raydiumService = useRaydiumService();

  return useQuery({
    queryKey: RAYDIUM_QUERY_KEYS.topPools(limit),
    queryFn: () => raydiumService.getTopPools(limit),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      if (error instanceof RaydiumError && error.statusCode >= 400 && error.statusCode < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Mutation hooks
export const useOptimizePortfolio = () => {
  const raydiumService = useRaydiumService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: PortfolioOptimizationRequest) => 
      raydiumService.optimizePortfolio(request),
    onSuccess: (result: PortfolioOptimizationResult) => {
      // Invalidate and refetch pools data
      queryClient.invalidateQueries({ 
        queryKey: RAYDIUM_QUERY_KEYS.pools() 
      });
      
      // Cache the optimization result
      queryClient.setQueryData(
        [...RAYDIUM_QUERY_KEYS.optimization(), 'latest'],
        result
      );
    },
    onError: (error) => {
      console.error('Portfolio optimization failed:', error);
    },
  });
};

// Combined hook for dashboard usage
export const useRaydiumDashboard = (riskLevel: 'low' | 'medium' | 'high' = 'medium') => {
  const topPoolsQuery = useTopRaydiumPools(3);
  const optimizeMutation = useOptimizePortfolio();

  const optimizePortfolio = async (): Promise<PortfolioOptimizationResult | undefined> => {
    try {
      const result = await optimizeMutation.mutateAsync({
        riskLevel,
        targetAllocation: 100,
        minApy: 5,
      });
      return result;
    } catch (error) {
      console.error('Optimization failed:', error);
      throw error;
    }
  };

  return {
    // Query data
    poolsData: topPoolsQuery.data,
    isLoading: topPoolsQuery.isLoading,
    error: topPoolsQuery.error || optimizeMutation.error,
    
    // Derived data
    portfolioData: {
      totalValueLocked: topPoolsQuery.data?.reduce((acc, pool) => acc + pool.tvl, 0) || 0,
      currentAPY: topPoolsQuery.data?.reduce((acc, pool) => 
        acc + (pool.apy / (topPoolsQuery.data?.length || 1)), 0) || 0,
      weeklyChange: 2.5, // This should come from actual data
      protocols: topPoolsQuery.data?.map(pool => ({
        name: pool.name,
        apy: `${pool.apy.toFixed(1)}%`,
        change: '+1.2%', // This should come from actual data
        positive: true,
        poolId: pool.id,
      })) || [],
    },
    
    // Actions
    optimizePortfolio,
    refetchPools: topPoolsQuery.refetch,
    
    // Loading states
    isOptimizing: optimizeMutation.isPending,
  };
};