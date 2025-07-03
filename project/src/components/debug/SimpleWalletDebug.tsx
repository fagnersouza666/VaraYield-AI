import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Bug, RefreshCw, CheckCircle, AlertCircle, Settings, Activity } from 'lucide-react';
import { RPCFallbackService } from '../../services/rpc-fallback.service';
import { useServices } from '../../services/service-provider';
import { WalletMode } from '../../services/api/wallet.service';
import { useWalletPortfolioDashboard } from '../../hooks/queries/useWalletPortfolio';
import ErrorDashboard from './ErrorDashboard';

const SimpleWalletDebug: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const { walletService } = useServices();
  const [endpointStatus, setEndpointStatus] = useState<any[]>([]);
  const { portfolio, isLoading, error, refetchAll } = useWalletPortfolioDashboard();
  const [currentEndpoint, setCurrentEndpoint] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [walletMode, setWalletModeState] = useState<WalletMode>('real'); // Production: only real data
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showErrorMonitoring, setShowErrorMonitoring] = useState(false);

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

  const getConnectionStatus = () => {
    if (isLoading) return { icon: RefreshCw, text: 'Conectando...', color: 'text-yellow-500', spinning: true };
    if (error) return { icon: AlertCircle, text: 'Erro nos dados', color: 'text-red-500', spinning: false };
    if (connected) return { icon: CheckCircle, text: 'Conectado', color: 'text-green-500', spinning: false };
    return { icon: AlertCircle, text: 'Desconectado', color: 'text-red-500', spinning: false };
  };

  const getPortfolioStatus = () => {
    if (isLoading) return { icon: RefreshCw, text: 'Carregando portfólio...', color: 'text-yellow-500', spinning: true };
    if (error) return { icon: AlertCircle, text: 'Erro nos dados', color: 'text-red-500', spinning: false };
    if (portfolio) return { icon: CheckCircle, text: 'Dados carregados', color: 'text-green-500', spinning: false };
    return { icon: AlertCircle, text: 'Sem dados', color: 'text-gray-500', spinning: false };
  };

  const handleDemoMode = () => {
    // Force demo mode by setting wallet mode to demo
    if (window.varaWalletService) {
      window.varaWalletService.setWalletMode('demo');
      refetchAll();
    } else {
      alert('Serviço de carteira não disponível. Recarregue a página.');
    }
  };

  const handleRealMode = () => {
    // Switch back to real mode
    if (window.varaWalletService) {
      window.varaWalletService.setWalletMode('real');
      refetchAll();
    } else {
      alert('Serviço de carteira não disponível. Recarregue a página.');
    }
  };

  const connectionStatus = getConnectionStatus();
  const portfolioStatus = getPortfolioStatus();

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
            onClick={() => setShowErrorMonitoring(!showErrorMonitoring)}
            className={`flex items-center px-3 py-2 ${showErrorMonitoring ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'} text-white rounded-lg text-sm`}
          >
            <Activity className="h-4 w-4 mr-2" />
            {showErrorMonitoring ? 'Hide' : 'Show'} Errors
          </button>
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
        {/* Production Mode Status */}
        <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Settings className="h-5 w-5 text-blue-400 mr-2" />
            <h3 className="font-medium text-blue-400">🏭 Modo Produção</h3>
          </div>
          <div className="space-y-3">
            <div className="text-blue-200 text-sm">
              <strong>Configuração atual:</strong> Apenas dados reais da blockchain Solana
            </div>
            <div className="bg-blue-800/30 p-3 rounded-lg">
              <div className="text-blue-100 text-sm font-medium mb-2">✅ Funcionalidades ativas:</div>
              <ul className="text-blue-200 text-xs space-y-1">
                <li>• Conexão direta com mainnet Solana</li>
                <li>• Sistema robusto de fallback RPC</li>
                <li>• Busca otimizada de tokens (SPL + Token-2022)</li>
                <li>• Preços em tempo real via CoinGecko/Jupiter</li>
                <li>• Sem dados mock ou demonstrativos</li>
              </ul>
            </div>
            <div className="text-xs text-blue-300 bg-blue-800/20 p-2 rounded">
              <strong>💡 Para melhor performance:</strong> Configure Helius Developer ($49/mês) - especializado em Solana.
              <a href="https://helius.dev" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                Criar conta
              </a>
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
              {connection.rpcEndpoint.includes('helius-rpc.com') && (
                <p className="text-green-400 text-xs mt-1">🚀 Using Helius endpoint - excellent for production</p>
              )}
              {connection.rpcEndpoint.includes('ankr.com') && (
                <p className="text-green-400 text-xs mt-1">✅ Using reliable Ankr endpoint</p>
              )}
              {connection.rpcEndpoint.includes('api.mainnet-beta.solana.com') && (
                <p className="text-yellow-400 text-xs mt-1">⚠️ Official endpoint may be rate limited - consider Helius</p>
              )}
              {connection.rpcEndpoint.includes('quiknode.pro') && (
                <p className="text-green-400 text-xs mt-1">🚀 Using QuickNode endpoint - good for production</p>
              )}
              {connection.rpcEndpoint.includes('alchemy.com') && (
                <p className="text-green-400 text-xs mt-1">🚀 Using Alchemy endpoint - enterprise grade</p>
              )}
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
            <div className="flex space-x-2">
              <button
                onClick={async () => {
                  setIsRefreshing(true);
                  try {
                    // Force test all endpoints and switch to best one
                    const connection = await rpcFallback.getWorkingConnection();
                    console.log('✅ Switched to best available endpoint');
                    await refreshEndpointStatus();
                    // Refresh wallet data
                    refetchAll();
                  } catch (error) {
                    console.error('❌ Failed to find working endpoint:', error);
                  } finally {
                    setIsRefreshing(false);
                  }
                }}
                disabled={isRefreshing}
                className="text-green-400 hover:text-green-300 text-sm disabled:opacity-50"
              >
                Find Best
              </button>
              <button
                onClick={resetEndpoints}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Reset All
              </button>
            </div>
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
            <p className="text-blue-300 text-sm mt-2">
              🏭 Modo Produção: Apenas dados reais da blockchain Solana serão exibidos. Sem fallbacks para dados mock.
            </p>
          </div>
        )}

        {/* Production Mode Information */}
        <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
          <h3 className="font-medium text-green-400 mb-2">🏭 Modo Produção Ativo</h3>
          <p className="text-green-300 text-sm mb-3">
            Sistema configurado para funcionar exclusivamente com dados reais da blockchain Solana.
          </p>
          <div className="text-green-200 text-xs space-y-1">
            <p>• <strong>Garantia:</strong> 100% dados reais da mainnet Solana</p>
            <p>• <strong>Performance:</strong> Serviço enhanced para busca otimizada</p>
            <p>• <strong>Confiabilidade:</strong> Sistema robusto de fallback RPC</p>
            <p>• <strong>Transparência:</strong> Erros reais quando RPC indisponível</p>
          </div>
        </div>

        {/* Portfolio Status */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <portfolioStatus.icon className={`h-4 w-4 mr-2 ${portfolioStatus.color} ${portfolioStatus.spinning ? 'animate-spin' : ''}`} />
              <span className="text-sm text-gray-300">{portfolioStatus.text}</span>
            </div>
            <button
              onClick={refetchAll}
              className="text-blue-400 hover:text-blue-300 text-xs"
              disabled={isLoading}
            >
              Atualizar
            </button>
          </div>
        </div>

        {/* Portfolio Value */}
        {portfolio && (
          <div className="text-xs text-gray-400">
            Valor total: ${portfolio.summary.totalValue.toFixed(2)}
            {portfolio.summary.totalValue === 0 && (
              <span className="text-yellow-500 ml-2">⚠️ Valores zerados</span>
            )}
          </div>
        )}

        {/* Error Details */}
        {error && (
          <div className="text-xs text-red-400 bg-red-900/20 p-2 rounded">
            <div className="font-medium">Erro:</div>
            <div className="mt-1">{error.message}</div>
          </div>
        )}

        {/* RPC Improvement Recommendations */}
        {(!currentEndpoint?.isWorking || currentEndpoint?.errorCount > 2) && (
          <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
            <h3 className="font-medium text-yellow-400 mb-3">🚀 Recomendações para Melhorar Conexão</h3>
            
            <div className="space-y-3">
              <div className="text-yellow-200 text-sm">
                <strong>Problema detectado:</strong> Endpoints RPC públicos estão instáveis ou com rate limiting.
              </div>
              
              <div className="space-y-2">
                <div className="text-yellow-100 text-sm">
                  <strong>Soluções imediatas:</strong>
                </div>
                <ul className="text-yellow-200 text-xs space-y-1 ml-4">
                  <li>• Clique em "Find Best" para trocar automaticamente para o melhor endpoint</li>
                  <li>• Tente recarregar a página para reinicializar conexões</li>
                  <li>• Use o modo "Demonstração" para testar a interface</li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="text-yellow-100 text-sm">
                  <strong>Para produção (recomendado):</strong>
                </div>
                <ul className="text-yellow-200 text-xs space-y-1 ml-4">
                  <li>• <strong>Helius:</strong> planos a partir de $99/mês - excelente para DeFi</li>
                  <li>• <strong>QuickNode:</strong> planos a partir de $9/mês - boa performance</li>
                  <li>• <strong>Alchemy:</strong> preço por uso - ideal para escala</li>
                  <li>• <strong>Ankr:</strong> $99/mês - descentralizado e confiável</li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="bg-yellow-800/30 p-2 rounded text-xs text-yellow-100">
                  <strong>💡 Dica:</strong> Endpoints RPC pagos oferecem maior limite de requests, menor latência e maior confiabilidade, essenciais para aplicações em produção.
                </div>
                <div className="bg-blue-800/30 p-2 rounded text-xs text-blue-100">
                  <strong>🚀 Recomendado:</strong> Helius Developer ($49/mês) - 10M créditos, especializado em Solana. 
                  <a href="https://helius.dev" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                    Criar conta
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Production Troubleshooting */}
        {portfolio?.summary.totalValue === 0 && (
          <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
            <div className="font-medium text-yellow-400 mb-2">💡 Valores zerados detectados</div>
            <p className="text-yellow-300 text-sm mb-3">Possíveis causas em ambiente de produção:</p>
            <ul className="text-yellow-200 text-xs space-y-1">
              <li>• <strong>Carteira vazia:</strong> Nenhum token ou SOL na carteira</li>
              <li>• <strong>RPC instável:</strong> Problemas temporários de conectividade</li>
              <li>• <strong>Tokens sem preço:</strong> Tokens muito novos ou sem liquidez</li>
              <li>• <strong>Rate limiting:</strong> Muitas requisições aos endpoints públicos</li>
            </ul>
            <div className="mt-3 p-2 bg-blue-800/30 rounded text-xs text-blue-100">
              <strong>Solução recomendada:</strong> Configure Helius Developer ($49/mês) para dados consistentes.
              <a href="https://helius.dev" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                Criar conta Helius
              </a>
            </div>
          </div>
        )}

        {/* Error Monitoring Dashboard */}
        {showErrorMonitoring && (
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center mb-4">
              <Activity className="h-5 w-5 text-red-400 mr-2" />
              <h3 className="font-medium text-white">Monitor de Erros em Tempo Real</h3>
            </div>
            <ErrorDashboard />
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleWalletDebug;