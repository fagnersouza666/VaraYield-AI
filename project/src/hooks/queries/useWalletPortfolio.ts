import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useCallback, useEffect, useMemo } from 'react';
import { SolanaWalletService } from '../../services/api/wallet.service';
import { WalletPortfolioService } from '../../services/api/wallet-portfolio.service';
import { PORTFOLIO_QUERY_KEYS } from './usePortfolio';
import { RaydiumError } from '../../utils/errors';

// Hook for wallet balances
export const useWalletBalances = (enabled: boolean = true) => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();

  const walletService = useMemo(() => {
    return new SolanaWalletService(connection);
  }, [connection]);

  return useQuery({
    queryKey: ['wallet', 'balances', publicKey?.toString()],
    queryFn: async () => {
      if (!publicKey) {
        throw new RaydiumError('Wallet not connected');
      }
      
      console.log('🔄 Fetching wallet balances for:', publicKey.toString());
      const startTime = Date.now();
      
      try {
        const result = await walletService.getWalletBalances(publicKey);
        const duration = Date.now() - startTime;
        console.log('✅ Wallet balances fetched successfully in', duration, 'ms');
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error('❌ Failed to fetch wallet balances after', duration, 'ms:', error);
        throw error;
      }
    },
    enabled: enabled && connected && !!publicKey,
    staleTime: 30 * 1000, // 30 seconds (reduced for better UX)
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry wallet connection errors
      if (error instanceof RaydiumError && error.message.includes('not connected')) {
        return false;
      }
      // Don't retry RPC endpoint errors too aggressively
      if (error instanceof RaydiumError && 
          (error.message.includes('RPC endpoint error') || 
           error.message.includes('Rate limit') ||
           error.message.includes('Network connection failed'))) {
        return failureCount < 1; // Only retry once for RPC errors
      }
      // Retry other errors up to 2 times
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
    onError: (error) => {
      console.error('Wallet balances query error:', error);
    },
  });
};

// Hook for wallet-based portfolio
export const useWalletPortfolio = (enabled: boolean = true) => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  const portfolioService = useMemo(() => {
    const walletService = new SolanaWalletService(connection);
    const service = new WalletPortfolioService(walletService, publicKey);
    return service;
  }, [connection, publicKey]);

  // Update service when wallet changes
  useEffect(() => {
    portfolioService.setPublicKey(publicKey);
  }, [portfolioService, publicKey]);

  const portfolioQuery = useQuery({
    queryKey: [...PORTFOLIO_QUERY_KEYS.summary(), 'wallet', publicKey?.toString()],
    queryFn: () => portfolioService.getPortfolio(),
    enabled: enabled && connected && !!publicKey,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry wallet connection errors
      if (error instanceof RaydiumError && error.message.includes('not connected')) {
        return false;
      }
      // Don't retry RPC endpoint errors too aggressively
      if (error instanceof RaydiumError && 
          (error.message.includes('RPC endpoint error') || 
           error.message.includes('Rate limit') ||
           error.message.includes('Network connection failed'))) {
        return failureCount < 1; // Only retry once for RPC errors
      }
      // Retry other errors up to 2 times
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
    onError: (error) => {
      console.error('Wallet portfolio query error:', error);
    },
  });

  // Auto-refresh when wallet changes
  const refreshPortfolio = useCallback(() => {
    if (connected && publicKey) {
      queryClient.invalidateQueries({ 
        queryKey: [...PORTFOLIO_QUERY_KEYS.summary(), 'wallet', publicKey.toString()] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['wallet', 'balances', publicKey.toString()] 
      });
    }
  }, [queryClient, connected, publicKey]);

  // Set up real-time updates (disabled for now to prevent performance issues)
  useEffect(() => {
    if (!connected || !publicKey) return;

    // Real-time updates can be resource intensive and cause loops
    // For now, we'll rely on manual refresh and periodic polling
    // TODO: Implement more efficient real-time updates later
    
    return () => {}; // No cleanup needed
  }, [connected, publicKey, connection]);

  return {
    ...portfolioQuery,
    refreshPortfolio,
    isWalletConnected: connected,
    walletAddress: publicKey?.toString(),
  };
};

// Combined hook for wallet portfolio dashboard
export const useWalletPortfolioDashboard = () => {
  const { connected } = useWallet();
  
  const portfolioQuery = useWalletPortfolio(connected);
  const balancesQuery = useWalletBalances(connected);

  return {
    // Portfolio data
    portfolio: portfolioQuery.data,
    balances: balancesQuery.data,

    // Loading states
    isLoadingPortfolio: portfolioQuery.isLoading,
    isLoadingBalances: balancesQuery.isLoading,
    isLoading: portfolioQuery.isLoading || balancesQuery.isLoading,

    // Connection state
    isWalletConnected: connected,
    walletAddress: portfolioQuery.walletAddress,

    // Errors
    portfolioError: portfolioQuery.error,
    balancesError: balancesQuery.error,
    error: portfolioQuery.error || balancesQuery.error,

    // Refetch functions
    refetchPortfolio: portfolioQuery.refetch,
    refetchBalances: balancesQuery.refetch,
    refreshPortfolio: portfolioQuery.refreshPortfolio,

    // Refetch all
    refetchAll: () => {
      portfolioQuery.refetch();
      balancesQuery.refetch();
    },

    // Status
    isError: portfolioQuery.isError || balancesQuery.isError,
    isSuccess: portfolioQuery.isSuccess && balancesQuery.isSuccess,
  };
};

// Hook for wallet connection status
export const useWalletConnection = () => {
  const { connected, connecting, disconnecting, publicKey, wallet } = useWallet();

  return {
    isConnected: connected,
    isConnecting: connecting,
    isDisconnecting: disconnecting,
    publicKey,
    walletName: wallet?.adapter.name,
    walletAddress: publicKey?.toString(),
  };
};