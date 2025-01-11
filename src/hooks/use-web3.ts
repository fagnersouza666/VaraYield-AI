import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { connectWallet, switchToMantle } from '@/lib/web3';
import { toast } from 'sonner';

export function useWeb3() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const { connectWallet: updateAuthWallet } = useAuth();

  // Handle chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleChainChanged = (chainId: string) => {
      setChainId(parseInt(chainId, 16));
    };

    window.ethereum.on('chainChanged', handleChainChanged);
    return () => {
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  const connect = useCallback(async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    try {
      const address = await connectWallet();
      updateAuthWallet(address);
      toast.success('Wallet connected successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect wallet');
      console.error('Wallet connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, updateAuthWallet]);

  return {
    connect,
    isConnecting,
    chainId,
    switchToMantle
  };
}