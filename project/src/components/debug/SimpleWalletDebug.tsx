import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Bug, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { RPCFallbackService } from '../../services/rpc-fallback.service';

const SimpleWalletDebug: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [endpointStatus, setEndpointStatus] = useState<any[]>([]);
  const [currentEndpoint, setCurrentEndpoint] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const rpcFallback = RPCFallbackService.getInstance();

  const refreshEndpointStatus = async () => {
    setIsRefreshing(true);
    try {
      // Get current status
      const status = rpcFallback.getEndpointStatus();
      const current = rpcFallback.getCurrentEndpoint();
      
      setEndpointStatus(status);
      setCurrentEndpoint(current);
    } catch (error) {
      console.error('Failed to refresh endpoint status:', error);
    } finally {
      setIsRefreshing(false);
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
              ✅ Wallet connected! Check the Portfolio tab to see your tokens.
            </p>
            <p className="text-green-300 text-sm mt-2">
              💡 If RPC endpoints fail, the app will automatically switch to demonstration mode with mock data.
            </p>
            <p className="text-blue-300 text-sm mt-1">
              🔧 For production, configure working RPC endpoints or use paid services like Helius, QuickNode, or Alchemy.
            </p>
          </div>
        )}

        {/* Mock Mode Warning */}
        <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
          <h3 className="font-medium text-yellow-400 mb-2">⚠️ RPC Endpoint Issues Detected</h3>
          <p className="text-yellow-300 text-sm mb-3">
            All public RPC endpoints are currently rate-limited or unavailable. The app will automatically use demonstration data.
          </p>
          <div className="text-yellow-200 text-xs space-y-1">
            <p>• <strong>Current Issue:</strong> Free RPC endpoints have strict rate limits</p>
            <p>• <strong>Demo Mode:</strong> Shows realistic portfolio data for interface testing</p>
            <p>• <strong>Production Solution:</strong> Use paid RPC providers for real data</p>
            <p>• <strong>Alternative:</strong> Try again later when rate limits reset</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleWalletDebug;