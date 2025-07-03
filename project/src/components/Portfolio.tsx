import React, { useCallback, useState } from 'react';
import { Plus, RefreshCw, Settings, Wallet } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWalletPortfolioDashboard } from '../hooks/queries/useWalletPortfolio';
import { ErrorMessage } from './ui/ErrorMessage';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { PortfolioOverview } from './portfolio/PortfolioOverview';
import { AssetAllocation } from './portfolio/AssetAllocation';
import { PositionsList } from './portfolio/PositionsList';
import { Position } from '../services/types/portfolio.types';

const Portfolio: React.FC = React.memo(() => {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [showAddPosition, setShowAddPosition] = useState(false);
  const { connected } = useWallet();

  const {
    portfolio,
    isLoading,
    error,
    refetchAll,
    isWalletConnected,
    walletAddress,
  } = useWalletPortfolioDashboard();

  const handleRefresh = useCallback(() => {
    refetchAll();
  }, [refetchAll]);

  const handleEditPosition = useCallback((position: Position) => {
    setSelectedPosition(position);
    // TODO: Open edit position modal
  }, []);

  const handleRemovePosition = useCallback(async (positionId: string) => {
    // For wallet portfolio, positions cannot be removed programmatically
    alert('To remove tokens from your portfolio, use your Solana wallet to transfer or swap them.');
  }, []);

  const handleAddPosition = useCallback(() => {
    // For wallet portfolio, direct to external wallet or DEX
    alert('To add tokens to your portfolio, use your Solana wallet or a DEX like Raydium to acquire tokens.');
  }, []);

  // Show wallet connection prompt if not connected
  if (!isWalletConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
        <Wallet className="h-16 w-16 text-gray-500" />
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            Connect your Solana wallet to view your portfolio and track your assets
          </p>
          <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700" />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading wallet portfolio..." />
      </div>
    );
  }

  if (error) {
    // Se for erro de RPC/conexão, mostra interface mais amigável
    const isRPCError = error?.message?.includes('RPC endpoint error') || 
                      error?.message?.includes('Solana') ||
                      error?.message?.includes('indisponíveis');
    
    if (isRPCError) {
      return (
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">My Wallet Portfolio</h1>
              <p className="text-gray-400 mt-1">
                {walletAddress ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}` : 'Wallet conectada'}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Tentar Novamente
              </button>
              
              <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 !h-10" />
            </div>
          </div>

          {/* Connection Error State */}
          <div className="bg-gray-800 rounded-xl p-8 text-center border border-yellow-500/20">
            <div className="text-yellow-500 mb-4">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="h-8 w-8" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Conectado, mas Aguardando Dados da Blockchain</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Sua carteira está conectada, mas não conseguimos acessar os dados da rede Solana no momento. 
              Isso pode ser devido a limitações dos provedores RPC gratuitos.
            </p>
            <div className="space-y-2 text-sm text-gray-500 mb-6">
              <p>• Os provedores RPC públicos têm limites de taxa</p>
              <p>• Tente novamente em alguns minutos</p>
              <p>• Para uso intensivo, considere um provedor RPC pago</p>
            </div>
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Tentar Conectar Novamente
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="p-8">
        <ErrorMessage
          error={error}
          title="Portfolio Error"
          onRetry={handleRefresh}
          showDetails={true}
        />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="p-8">
        <ErrorMessage
          title="No Portfolio Data"
          message="Unable to load wallet portfolio information"
          onRetry={handleRefresh}
        />
      </div>
    );
  }

  // Show empty state if no positions (but still show wallet info)
  if (portfolio.positions.length === 0) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">My Wallet Portfolio</h1>
            <p className="text-gray-400 mt-1">
              {walletAddress ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}` : 'Loading wallet...'}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 !h-10" />
          </div>
        </div>

        {/* Empty State */}
        <div className="text-center py-12">
          <Wallet className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Assets Found</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Your wallet appears to be empty or contains only very small amounts. 
            Add some SOL or tokens to see your portfolio.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              • Purchase SOL from an exchange and transfer to your wallet
            </p>
            <p className="text-sm text-gray-500">
              • Use a DEX like Raydium to swap for other tokens
            </p>
            <p className="text-sm text-gray-500">
              • Make sure you're connected to the correct wallet
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Wallet Portfolio</h1>
          <p className="text-gray-400 mt-1">
            {walletAddress ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}` : 'Loading wallet...'}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 !h-10" />
        </div>
      </div>

      {/* Portfolio Overview */}
      <PortfolioOverview summary={portfolio.summary} />

      {/* Asset Allocation & Positions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Asset Allocation */}
        <div className="xl:col-span-1">
          <AssetAllocation positions={portfolio.positions} />
        </div>

        {/* Positions List */}
        <div className="xl:col-span-2">
          <PositionsList
            positions={portfolio.positions}
            onEditPosition={handleEditPosition}
            onRemovePosition={handleRemovePosition}
            isLoading={false}
          />
        </div>
      </div>

      {/* Wallet Info */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Wallet Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2">Wallet Address</h4>
            <p className="text-white font-mono text-sm break-all">{walletAddress}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2">Network</h4>
            <p className="text-white">Solana {import.meta.env.VITE_VARA_NETWORK === 'devnet' ? 'Devnet' : 'Mainnet'}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            This portfolio displays your actual Solana wallet holdings. To manage your tokens, use your connected wallet or visit a DEX like Raydium.
          </p>
        </div>
      </div>
    </div>
  );
});

Portfolio.displayName = 'Portfolio';

export default Portfolio;