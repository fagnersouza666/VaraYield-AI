import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import '@solana/wallet-adapter-react-ui/styles.css';

// Use the RPC endpoint configured in environment with reliable fallbacks
const getEndpoint = () => {
  const configuredEndpoint = import.meta.env.VITE_VARA_RPC_URL;
  
  // List of working free endpoints - tested and verified
  const reliableEndpoints = [
    'https://rpc.ankr.com/solana',
    'https://solana-api.projectserum.com',
    'https://ssc-dao.genesysgo.net',
  ];
  
  // Check if configured endpoint is reliable
  if (configuredEndpoint && reliableEndpoints.includes(configuredEndpoint)) {
    return configuredEndpoint;
  }
  
  // Default to most reliable endpoint
  return reliableEndpoints[0];
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