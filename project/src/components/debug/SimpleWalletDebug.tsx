import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Bug, RefreshCw, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { RPCFallbackService } from '../../services/rpc-fallback.service';
import { useServices } from '../../services/service-provider';
import { WalletMode } from '../../services/api/wallet.service';

const SimpleWalletDebug: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const { walletService } = useServices();
  const [endpointStatus, setEndpointStatus] = useState<any[]>([]);
  const [currentEndpoint, setCurrentEndpoint] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [walletMode, setWalletModeState] = useState<WalletMode>('error');

  const rpcFallback = RPCFallbackService.getInstance();

  const refreshEndpointStatus = async () => {
    setIsRefreshing(true);
    try {
      // Get current status
      const status = rpcFallback.getEndpointStatus();
      const current = rpcFallback.getCurrentEndpoint();
      
      setEndpointStatus(status);
      setCurrentEndpoint(current);
      
      // Update wallet mode state
      if (walletService && 'getWalletMode' in walletService) {
        setWalletModeState(walletService.getWalletMode());
      }
    } catch (error) {
      console.error('Failed to refresh endpoint status:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleWalletModeChange = (mode: WalletMode) => {
    if (walletService && 'setWalletMode' in walletService) {
      walletService.setWalletMode(mode);
      setWalletModeState(mode);
      console.log(`🔧 Wallet mode changed to: ${mode}`);
    }
  };

  const resetEndpoints = () => {
    rpcFallback.resetEndpoints();
    refreshEndpointStatus();
  };

  useEffect(() => {
    refreshEndpointStatus();
  }, []);

  return (
    <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Bug className="h-6 w-6 text-yellow-500 mr-3" />
          <h2 className="text-xl font-semibold text-white">RPC & Wallet Debug</h2>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshEndpointStatus}
            disabled={isRefreshing}
            className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg text-sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700" />
        </div>
      </div>

      <div className="space-y-6">
        {/* Wallet Mode Configuration */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Settings className="h-5 w-5 text-blue-400 mr-2" />
            <h3 className="font-medium text-white">Modo do Portfólio</h3>
          </div>
          <div className="space-y-3">
            <p className="text-gray-300 text-sm">Escolha como o sistema deve se comportar quando os servidores RPC falham:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => handleWalletModeChange('error')}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  walletMode === 'error'
                    ? 'bg-red-600 border-red-500 text-white'
                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <div className="text-left">
                  <div className="font-semibold">❌ Mostrar Erro</div>
                  <div className="text-xs opacity-80">Mostra erro real quando RPC falha</div>
                </div>
              </button>
              <button
                onClick={() => handleWalletModeChange('real')}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  walletMode === 'real'
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <div className="text-left">
                  <div className="font-semibold">📡 Apenas Real</div>
                  <div className="text-xs opacity-80">Só tenta usar dados reais</div>
                </div>
              </button>
              <button
                onClick={() => handleWalletModeChange('demo')}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  walletMode === 'demo'
                    ? 'bg-yellow-600 border-yellow-500 text-white'
                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <div className="text-left">
                  <div className="font-semibold">🎭 Demonstração</div>
                  <div className="text-xs opacity-80">Usa dados mock quando falha</div>
                </div>
              </button>
            </div>
            <div className="text-xs text-gray-400 bg-gray-800 p-2 rounded">
              <strong>Modo atual:</strong> {walletMode === 'error' ? 'Mostrar Erro' : walletMode === 'real' ? 'Apenas Real' : 'Demonstração'}
            </div>
          </div>
        </div>

        {/* Current Connection Status */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="font-medium text-white mb-3">Current Connection</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Wallet Connected</p>
              <p className="text-white">
                {connected ? '✅ Yes' : '❌ No'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Primary RPC Endpoint</p>
              <p className="text-white text-sm break-all">{connection.rpcEndpoint}</p>
            </div>
            {currentEndpoint && (
              <>
                <div>
                  <p className="text-gray-400 text-sm">Active Fallback Endpoint</p>
                  <p className="text-white">{currentEndpoint.name}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Endpoint Status</p>
                  <p className={`${currentEndpoint.isWorking ? 'text-green-400' : 'text-red-400'}`}>
                    {currentEndpoint.isWorking ? '✅ Working' : '❌ Not Working'}
                  </p>
                </div>
              </>
            )}
          </div>
          {publicKey && (
            <div className="mt-3 pt-3 border-t border-gray-600">
              <p className="text-gray-400 text-sm">Wallet Address</p>
              <p className="text-white font-mono text-sm break-all">{publicKey.toString()}</p>
            </div>
          )}
        </div>

        {/* RPC Endpoints Status */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-white">RPC Endpoints Status</h3>
            <button
              onClick={resetEndpoints}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Reset All
            </button>
          </div>
          <div className="space-y-2">
            {endpointStatus.map((endpoint, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  {endpoint.isWorking ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="text-white font-medium">{endpoint.name}</p>
                    <p className="text-gray-400 text-xs">Priority: {endpoint.priority}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm ${endpoint.isWorking ? 'text-green-400' : 'text-red-400'}`}>
                    {endpoint.isWorking ? 'Working' : 'Failed'}
                  </p>
                  {endpoint.errorCount > 0 && (
                    <p className="text-red-400 text-xs">Errors: {endpoint.errorCount}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {!connected && (
          <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
            <p className="text-yellow-400">
              👆 Connect your wallet above to start debugging
            </p>
          </div>
        )}

        {connected && (
          <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
            <p className="text-green-400">
              ✅ Carteira conectada! Verifique a aba Portfolio para ver seus tokens.
            </p>
            {walletMode === 'error' && (
              <p className="text-yellow-300 text-sm mt-2">
                ⚠️ Modo atual: Mostrar Erro - Você verá erros se os servidores RPC estiverem indisponíveis.
              </p>
            )}
            {walletMode === 'demo' && (
              <p className="text-blue-300 text-sm mt-2">
                🎭 Modo atual: Demonstração - Dados mock serão usados se RPC falhar.
              </p>
            )}
            {walletMode === 'real' && (
              <p className="text-blue-300 text-sm mt-2">
                📡 Modo atual: Apenas Real - Somente dados reais da blockchain serão exibidos.
              </p>
            )}
          </div>
        )}

        {/* Status based on wallet mode */}
        {walletMode === 'error' && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
            <h3 className="font-medium text-red-400 mb-2">❌ Modo: Mostrar Erros Reais</h3>
            <p className="text-red-300 text-sm mb-3">
              Quando os servidores RPC estão indisponíveis, você verá os erros reais ao invés de dados demonstrativos.
            </p>
            <div className="text-red-200 text-xs space-y-1">
              <p>• <strong>Vantagem:</strong> Você sabe exatamente o que está acontecendo</p>
              <p>• <strong>Desvantagem:</strong> Interface pode ficar vazia quando RPC falha</p>
              <p>• <strong>Solução:</strong> Use provedores RPC pagos ou tente mais tarde</p>
            </div>
          </div>
        )}

        {walletMode === 'demo' && (
          <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
            <h3 className="font-medium text-yellow-400 mb-2">🎭 Modo: Demonstração</h3>
            <p className="text-yellow-300 text-sm mb-3">
              Quando os servidores RPC falham, dados demonstrativos realistas são exibidos para testar a interface.
            </p>
            <div className="text-yellow-200 text-xs space-y-1">
              <p>• <strong>Vantagem:</strong> Interface sempre funciona, mesmo com RPC indisponível</p>
              <p>• <strong>Demonstração:</strong> Mostra dados realistas de portfólio para testes</p>
              <p>• <strong>Produção:</strong> Configure endpoints RPC pagos para dados reais</p>
            </div>
          </div>
        )}

        {walletMode === 'real' && (
          <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
            <h3 className="font-medium text-blue-400 mb-2">📡 Modo: Apenas Dados Reais</h3>
            <p className="text-blue-300 text-sm mb-3">
              Apenas dados reais da blockchain Solana serão exibidos. Nenhum dado mock ou demonstrativo.
            </p>
            <div className="text-blue-200 text-xs space-y-1">
              <p>• <strong>Garantia:</strong> Todos os dados são 100% reais da blockchain</p>
              <p>• <strong>Requisito:</strong> Servidores RPC devem estar funcionando</p>
              <p>• <strong>Recomendação:</strong> Use com endpoints RPC confiáveis</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleWalletDebug;