import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePortfolioService } from '../../services/service-provider';
import {
  AddPositionRequest,
  UpdatePositionRequest,
  RebalanceRequest,
  PortfolioPerformance,
} from '../../services/types/portfolio.types';
import { RaydiumError } from '../../utils/errors';

// Query Keys
export const PORTFOLIO_QUERY_KEYS = {
  all: ['portfolio'] as const,
  summary: () => [...PORTFOLIO_QUERY_KEYS.all, 'summary'] as const,
  positions: () => [...PORTFOLIO_QUERY_KEYS.all, 'positions'] as const,
  performance: (period?: PortfolioPerformance['period']) => 
    [...PORTFOLIO_QUERY_KEYS.all, 'performance', period] as const,
  recommendations: () => [...PORTFOLIO_QUERY_KEYS.all, 'recommendations'] as const,
  transactions: (limit?: number) => [...PORTFOLIO_QUERY_KEYS.all, 'transactions', limit] as const,
  assets: () => [...PORTFOLIO_QUERY_KEYS.all, 'assets'] as const,
} as const;

// Portfolio overview hook
export const usePortfolio = (enabled: boolean = true) => {
  const portfolioService = usePortfolioService();

  return useQuery({
    queryKey: PORTFOLIO_QUERY_KEYS.summary(),
    queryFn: () => portfolioService.getPortfolio(),
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error instanceof RaydiumError && error.statusCode >= 400 && error.statusCode < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Portfolio performance hook
export const usePortfolioPerformance = (
  period: PortfolioPerformance['period'] = '7d',
  enabled: boolean = true
) => {
  const portfolioService = usePortfolioService();

  return useQuery({
    queryKey: PORTFOLIO_QUERY_KEYS.performance(period),
    queryFn: () => portfolioService.getPortfolioPerformance(period),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      if (error instanceof RaydiumError && error.statusCode >= 400 && error.statusCode < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Rebalance recommendations hook
export const useRebalanceRecommendations = (enabled: boolean = true) => {
  const portfolioService = usePortfolioService();

  return useQuery({
    queryKey: PORTFOLIO_QUERY_KEYS.recommendations(),
    queryFn: () => portfolioService.getRebalanceRecommendations(),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: (failureCount, error) => {
      if (error instanceof RaydiumError && error.statusCode >= 400 && error.statusCode < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Transaction history hook
export const useTransactionHistory = (limit: number = 50, enabled: boolean = true) => {
  const portfolioService = usePortfolioService();

  return useQuery({
    queryKey: PORTFOLIO_QUERY_KEYS.transactions(limit),
    queryFn: () => portfolioService.getTransactionHistory(limit),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Available assets hook
export const useAvailableAssets = (enabled: boolean = true) => {
  const portfolioService = usePortfolioService();

  return useQuery({
    queryKey: PORTFOLIO_QUERY_KEYS.assets(),
    queryFn: () => portfolioService.getAvailableAssets(),
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Mutation hooks
export const useAddPosition = () => {
  const portfolioService = usePortfolioService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AddPositionRequest) => portfolioService.addPosition(request),
    onSuccess: () => {
      // Invalidate portfolio data
      queryClient.invalidateQueries({ queryKey: PORTFOLIO_QUERY_KEYS.summary() });
      queryClient.invalidateQueries({ queryKey: PORTFOLIO_QUERY_KEYS.positions() });
      queryClient.invalidateQueries({ queryKey: PORTFOLIO_QUERY_KEYS.recommendations() });
    },
    onError: (error) => {
      console.error('Failed to add position:', error);
    },
  });
};

export const useUpdatePosition = () => {
  const portfolioService = usePortfolioService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ positionId, request }: { positionId: string; request: UpdatePositionRequest }) =>
      portfolioService.updatePosition(positionId, request),
    onSuccess: () => {
      // Invalidate portfolio data
      queryClient.invalidateQueries({ queryKey: PORTFOLIO_QUERY_KEYS.summary() });
      queryClient.invalidateQueries({ queryKey: PORTFOLIO_QUERY_KEYS.positions() });
      queryClient.invalidateQueries({ queryKey: PORTFOLIO_QUERY_KEYS.recommendations() });
    },
    onError: (error) => {
      console.error('Failed to update position:', error);
    },
  });
};

export const useRemovePosition = () => {
  const portfolioService = usePortfolioService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (positionId: string) => portfolioService.removePosition(positionId),
    onSuccess: () => {
      // Invalidate portfolio data
      queryClient.invalidateQueries({ queryKey: PORTFOLIO_QUERY_KEYS.summary() });
      queryClient.invalidateQueries({ queryKey: PORTFOLIO_QUERY_KEYS.positions() });
      queryClient.invalidateQueries({ queryKey: PORTFOLIO_QUERY_KEYS.recommendations() });
    },
    onError: (error) => {
      console.error('Failed to remove position:', error);
    },
  });
};

export const useExecuteRebalance = () => {
  const portfolioService = usePortfolioService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RebalanceRequest) => portfolioService.executeRebalance(request),
    onSuccess: () => {
      // Invalidate all portfolio data after rebalance
      queryClient.invalidateQueries({ queryKey: PORTFOLIO_QUERY_KEYS.all });
    },
    onError: (error) => {
      console.error('Failed to execute rebalance:', error);
    },
  });
};

// Combined hook for portfolio dashboard
export const usePortfolioDashboard = () => {
  const portfolioQuery = usePortfolio();
  const performanceQuery = usePortfolioPerformance('7d');
  const recommendationsQuery = useRebalanceRecommendations();
  const transactionsQuery = useTransactionHistory(10);

  return {
    // Data
    portfolio: portfolioQuery.data,
    performance: performanceQuery.data,
    recommendations: recommendationsQuery.data,
    recentTransactions: transactionsQuery.data,

    // Loading states
    isLoadingPortfolio: portfolioQuery.isLoading,
    isLoadingPerformance: performanceQuery.isLoading,
    isLoadingRecommendations: recommendationsQuery.isLoading,
    isLoadingTransactions: transactionsQuery.isLoading,

    // Overall loading
    isLoading: portfolioQuery.isLoading || performanceQuery.isLoading,

    // Errors
    portfolioError: portfolioQuery.error,
    performanceError: performanceQuery.error,
    recommendationsError: recommendationsQuery.error,
    transactionsError: transactionsQuery.error,

    // Refetch functions
    refetchPortfolio: portfolioQuery.refetch,
    refetchPerformance: performanceQuery.refetch,
    refetchRecommendations: recommendationsQuery.refetch,
    refetchTransactions: transactionsQuery.refetch,

    // Refetch all
    refetchAll: () => {
      portfolioQuery.refetch();
      performanceQuery.refetch();
      recommendationsQuery.refetch();
      transactionsQuery.refetch();
    },
  };
};