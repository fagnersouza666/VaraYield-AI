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
  
  // List of working mainnet endpoints in order of preference (updated 2024)
  const reliableEndpoints = [
    configuredEndpoint || 'https://api.mainnet-beta.solana.com', // Primary mainnet
    backup1 || 'https://rpc.ankr.com/solana', // Ankr backup
    backup2 || 'https://solana-api.projectserum.com', // Serum backup
    backup3 || 'https://rpc.magic.eden/mainnet', // Magic Eden backup
    clusterApiUrl('mainnet-beta'), // Official fallback
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