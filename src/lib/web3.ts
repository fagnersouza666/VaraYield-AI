import { CONTRACTS, NETWORK } from '@/config/contracts';

// Utility functions for web3 interactions
export async function connectWallet(): Promise<string> {
  if (!window.ethereum) {
    throw new Error('Please install MetaMask to use this application');
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });

    // Switch to Mantle network if not already on it
    await switchToMantle();

    return accounts[0];
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
}

export async function switchToMantle() {
  if (!window.ethereum) return;

  try {
    // Try to switch to Mantle network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${NETWORK.id.toString(16)}` }],
    });
  } catch (error: any) {
    // If the network doesn't exist, add it
    if (error.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: `0x${NETWORK.id.toString(16)}`,
            chainName: NETWORK.name,
            nativeCurrency: {
              name: 'Mantle',
              symbol: 'MNT',
              decimals: 18,
            },
            rpcUrls: [NETWORK.rpcUrl],
            blockExplorerUrls: [NETWORK.explorerUrl],
          },
        ],
      });
    } else {
      throw error;
    }
  }
}

// Add type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (params: any) => void) => void;
      removeListener: (event: string, callback: (params: any) => void) => void;
    };
  }
}