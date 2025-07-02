import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useConnection } from '@solana/wallet-adapter-react';
import { useMemo, useEffect, useState } from 'react';
import { PoolAnalyticsService, PoolMetrics, PoolAnalytics, NewPoolAlert } from '../../services/api/pool-analytics.service';
import { RaydiumError } from '../../utils/errors';

// Query keys
export const POOL_ANALYTICS_QUERY_KEYS = {
  all: ['pool-analytics'] as const,
  analytics: () => [...POOL_ANALYTICS_QUERY_KEYS.all, 'analytics'] as const,
  metrics: (poolIds: string[]) => [...POOL_ANALYTICS_QUERY_KEYS.all, 'metrics', poolIds] as const,
  optimal: (amount: number, risk: string, minAPY: number) => 
    [...POOL_ANALYTICS_QUERY_KEYS.all, 'optimal', amount, risk, minAPY] as const,
  history: (poolId: string, days: number) => 
    [...POOL_ANALYTICS_QUERY_KEYS.all, 'history', poolId, days] as const,
};

// Hook for general pool analytics
export const usePoolAnalytics = (enabled: boolean = true) => {
  const { connection } = useConnection();

  const poolAnalyticsService = useMemo(() => {
    return new PoolAnalyticsService(connection);
  }, [connection]);

  return useQuery({
    queryKey: POOL_ANALYTICS_QUERY_KEYS.analytics(),
    queryFn: () => poolAnalyticsService.getPoolAnalytics(),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      if (error instanceof RaydiumError) {
        return failureCount < 2;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    onError: (error) => {
      console.error('Pool analytics query error:', error);
    },
  });
};

// Hook for specific pool metrics
export const usePoolMetrics = (poolIds: string[], enabled: boolean = true) => {
  const { connection } = useConnection();

  const poolAnalyticsService = useMemo(() => {
    return new PoolAnalyticsService(connection);
  }, [connection]);

  return useQuery({
    queryKey: POOL_ANALYTICS_QUERY_KEYS.metrics(poolIds),
    queryFn: () => poolAnalyticsService.getPoolMetrics(poolIds),
    enabled: enabled && poolIds.length > 0,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    onError: (error) => {
      console.error('Pool metrics query error:', error);
    },
  });
};

// Hook for optimal pool recommendations
export const useOptimalPools = (
  targetAmount: number,
  riskTolerance: 'low' | 'medium' | 'high',
  minAPY: number = 5,
  enabled: boolean = true
) => {
  const { connection } = useConnection();

  const poolAnalyticsService = useMemo(() => {
    return new PoolAnalyticsService(connection);
  }, [connection]);

  return useQuery({
    queryKey: POOL_ANALYTICS_QUERY_KEYS.optimal(targetAmount, riskTolerance, minAPY),
    queryFn: () => poolAnalyticsService.getOptimalPoolsForYield(targetAmount, riskTolerance, minAPY),
    enabled: enabled && targetAmount > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    onError: (error) => {
      console.error('Optimal pools query error:', error);
    },
  });
};

// Hook for pool performance history
export const usePoolHistory = (poolId: string, days: number = 30, enabled: boolean = true) => {
  const { connection } = useConnection();

  const poolAnalyticsService = useMemo(() => {
    return new PoolAnalyticsService(connection);
  }, [connection]);

  return useQuery({
    queryKey: POOL_ANALYTICS_QUERY_KEYS.history(poolId, days),
    queryFn: () => poolAnalyticsService.getPoolPerformanceHistory(poolId, days),
    enabled: enabled && !!poolId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    onError: (error) => {
      console.error('Pool history query error:', error);
    },
  });
};

// Hook for real-time pool monitoring
export const useNewPoolMonitoring = (enabled: boolean = false) => {
  const { connection } = useConnection();
  const [newPoolAlerts, setNewPoolAlerts] = useState<NewPoolAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const poolAnalyticsService = useMemo(() => {
    return new PoolAnalyticsService(connection);
  }, [connection]);

  useEffect(() => {
    if (!enabled || isMonitoring) return;

    let cleanup: (() => void) | null = null;

    const startMonitoring = async () => {
      try {
        setIsMonitoring(true);
        console.log('🔄 Starting new pool monitoring...');

        cleanup = await poolAnalyticsService.monitorNewPools((alert: NewPoolAlert) => {
          setNewPoolAlerts(prev => {
            // Keep only the last 50 alerts
            const newAlerts = [alert, ...prev].slice(0, 50);
            return newAlerts;
          });

          // Optional: Show browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('New Pool Detected!', {
              body: `${alert.tokenPair} - Potential APY: ${alert.potentialAPY.toFixed(1)}%`,
              icon: '/favicon.ico',
            });
          }
        });
      } catch (error) {
        console.error('Failed to start pool monitoring:', error);
        setIsMonitoring(false);
      }
    };

    startMonitoring();

    return () => {
      if (cleanup) {
        cleanup();
        setIsMonitoring(false);
      }
    };
  }, [enabled, poolAnalyticsService, isMonitoring]);

  const clearAlerts = () => {
    setNewPoolAlerts([]);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  };

  return {
    newPoolAlerts,
    isMonitoring,
    clearAlerts,
    requestNotificationPermission,
    alertCount: newPoolAlerts.length,
    latestAlert: newPoolAlerts[0] || null,
  };
};

// Hook for pool analytics dashboard
export const usePoolAnalyticsDashboard = () => {
  const analyticsQuery = usePoolAnalytics();
  const queryClient = useQueryClient();

  const refreshAnalytics = () => {
    queryClient.invalidateQueries({ queryKey: POOL_ANALYTICS_QUERY_KEYS.analytics() });
  };

  const refreshAllData = () => {
    queryClient.invalidateQueries({ queryKey: POOL_ANALYTICS_QUERY_KEYS.all });
  };

  return {
    // Data
    analytics: analyticsQuery.data,
    
    // Loading states
    isLoading: analyticsQuery.isLoading,
    isRefreshing: analyticsQuery.isFetching && !analyticsQuery.isLoading,
    
    // Error state
    error: analyticsQuery.error,
    isError: analyticsQuery.isError,
    
    // Actions
    refreshAnalytics,
    refreshAllData,
    refetch: analyticsQuery.refetch,
    
    // Status
    lastUpdated: analyticsQuery.dataUpdatedAt,
  };
};

// Utility hook for pool calculations
export const usePoolCalculations = () => {
  const calculatePoolAPY = (fees24h: number, tvl: number): number => {
    if (tvl === 0) return 0;
    const dailyYield = fees24h / tvl;
    const annualYield = dailyYield * 365;
    return annualYield * 100; // Convert to percentage
  };

  const calculateImpermanentLoss = (
    initialPriceRatio: number,
    currentPriceRatio: number
  ): number => {
    if (initialPriceRatio === 0) return 0;
    
    const ratio = currentPriceRatio / initialPriceRatio;
    const impermanentLoss = (2 * Math.sqrt(ratio)) / (1 + ratio) - 1;
    return impermanentLoss * 100; // Convert to percentage
  };

  const calculateOptimalAllocation = (
    pools: PoolMetrics[],
    totalAmount: number,
    riskTolerance: 'low' | 'medium' | 'high'
  ): { poolId: string; allocation: number; amount: number }[] => {
    if (pools.length === 0) return [];

    // Simple allocation strategy based on risk tolerance
    const riskWeights = {
      low: { maxSinglePool: 0.3, preferStablePools: true },
      medium: { maxSinglePool: 0.5, preferStablePools: false },
      high: { maxSinglePool: 0.8, preferStablePools: false },
    };

    const weights = riskWeights[riskTolerance];
    const sortedPools = [...pools].sort((a, b) => {
      if (weights.preferStablePools) {
        return b.lpBurnPercentage - a.lpBurnPercentage;
      }
      return b.apy - a.apy;
    });

    const allocations: { poolId: string; allocation: number; amount: number }[] = [];
    let remainingAmount = totalAmount;
    let remainingAllocation = 1.0;

    for (let i = 0; i < sortedPools.length && remainingAllocation > 0.01; i++) {
      const pool = sortedPools[i];
      const maxAllocation = Math.min(weights.maxSinglePool, remainingAllocation);
      const allocation = Math.min(maxAllocation, remainingAllocation / (sortedPools.length - i));
      const amount = totalAmount * allocation;

      allocations.push({
        poolId: pool.id,
        allocation,
        amount,
      });

      remainingAllocation -= allocation;
      remainingAmount -= amount;
    }

    return allocations;
  };

  return {
    calculatePoolAPY,
    calculateImpermanentLoss,
    calculateOptimalAllocation,
  };
};