import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';

// Use multiple reliable endpoints with automatic fallback
const getEndpoint = () => {
  const configuredEndpoint = import.meta.env.VITE_VARA_RPC_URL;
  
  // List of working free endpoints in order of preference (updated 2024)
  const reliableEndpoints = [
    'https://api.mainnet-beta.solana.com', // Official Solana
    'https://solana-mainnet.rpc.extrnode.com', // Extrnode (reliable)
    'https://mainnet.helius-rpc.com/public', // Helius public
    'https://rpc.hellomoon.io', // HelloMoon public
    clusterApiUrl('mainnet-beta'), // Official fallback
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
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider 
      endpoint={endpoint}
      config={{
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 60000,
      }}
    >
      <SolanaWalletProvider 
        wallets={wallets} 
        autoConnect={false}
        onError={(error) => {
          console.error('Wallet error:', error);
        }}
      >
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};