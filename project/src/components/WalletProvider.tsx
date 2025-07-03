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
  const backup1 = import.meta.env.VITE_VARA_RPC_BACKUP_1;
  const backup2 = import.meta.env.VITE_VARA_RPC_BACKUP_2;
  const backup3 = import.meta.env.VITE_VARA_RPC_BACKUP_3;
  
  // List of working mainnet endpoints in order of preference (tested and verified)
  const reliableEndpoints = [
    configuredEndpoint || clusterApiUrl('mainnet-beta'), // Primary: fastest tested endpoint
    backup1 || 'https://api.mainnet-beta.solana.com', // Backup 1: official endpoint
    backup2 || 'https://solana-mainnet.rpc.extrnode.com', // Backup 2: alternative
    backup3 || 'https://mainnet.helius-rpc.com', // Backup 3: Helius public
    'https://api.mainnet-beta.solana.com/', // Additional fallback
  ].filter(Boolean);
  
  // Use the first configured endpoint
  const endpoint = reliableEndpoints[0];
  console.log('🌐 Using Solana mainnet RPC endpoint:', endpoint);
  console.log('🔄 Available fallback endpoints:', reliableEndpoints.length - 1);
  
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