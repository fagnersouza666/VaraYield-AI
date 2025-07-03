import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';
import { PhantomWalletAdapterWithTimeout } from '../utils/wallet-timeout';

// Use multiple reliable endpoints with automatic fallback
const getEndpoint = () => {
  const configuredEndpoint = import.meta.env.VITE_VARA_RPC_URL;
  
  // List of working free endpoints in order of preference (updated 2024)
  const reliableEndpoints = [
    'https://api.devnet.solana.com', // Devnet for testing - more stable
    'https://api.mainnet-beta.solana.com', // Official Solana
    clusterApiUrl('devnet'), // Devnet fallback - better for development
    clusterApiUrl('mainnet-beta'), // Mainnet fallback
  ];
  
  // If configured endpoint exists and is not empty, try it first
  if (configuredEndpoint && configuredEndpoint.trim() !== '') {
    console.log('🔧 Using configured RPC endpoint:', configuredEndpoint);
    return configuredEndpoint;
  }
  
  // Default to first reliable endpoint
  const endpoint = reliableEndpoints[0];
  console.log('🌐 Using default RPC endpoint:', endpoint);
  return endpoint;
};

const endpoint = getEndpoint();

// Log the endpoint being used for debugging
console.log('🌐 Final Solana RPC endpoint:', endpoint);

interface Props {
  children: ReactNode;
}

export const WalletProvider: FC<Props> = ({ children }) => {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapterWithTimeout(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider 
        wallets={wallets} 
        autoConnect={false}
        onError={(error) => {
          console.error('🚨 Wallet connection error:', error);
          // Don't throw, just log the error
        }}
      >
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};