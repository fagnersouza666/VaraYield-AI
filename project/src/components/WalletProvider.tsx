import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import '@solana/wallet-adapter-react-ui/styles.css';

// Use the RPC endpoint configured in environment with fallbacks
const getEndpoint = () => {
  const configuredEndpoint = import.meta.env.VITE_VARA_RPC_URL;
  
  // List of reliable endpoints in order of preference
  const fallbackEndpoints = [
    'https://rpc.helius.xyz/?api-key=public',
    'https://rpc.ankr.com/solana',
    'https://solana-api.projectserum.com',
    'https://api.devnet.solana.com', // Last resort - devnet
  ];
  
  if (configuredEndpoint && !configuredEndpoint.includes('api.mainnet-beta.solana.com')) {
    return configuredEndpoint;
  }
  
  // If using the problematic endpoint or no endpoint configured, use first fallback
  return fallbackEndpoints[0];
};

const endpoint = getEndpoint();

// Log the endpoint being used for debugging
console.log('🌐 Using Solana RPC endpoint:', endpoint);

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
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};