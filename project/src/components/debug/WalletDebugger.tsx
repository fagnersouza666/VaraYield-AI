import React, { useState, useCallback, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Wallet } from 'lucide-react';
import { SolanaWalletService } from '../../services/api/wallet.service';
import { RPCFallbackService } from '../../services/rpc-fallback.service';
import { RaydiumError } from '../../utils/errors';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  data?: any;
  duration?: number;
}

export const WalletDebugger: React.FC = () => {
  const { connected, publicKey, wallet } = useWallet();
  const { connection } = useConnection();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [walletService, setWalletService] = useState<SolanaWalletService | null>(null);

  // Initialize wallet service when connection changes
  useEffect(() => {
    if (connection) {
      const service = new SolanaWalletService(connection);
      setWalletService(service);
    }
  }, [connection]);

  const addResult = useCallback((result: TestResult) => {
    setResults(prev => [...prev, result]);
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  const runDiagnostics = useCallback(async () => {
    if (!publicKey || !walletService) {
      addResult({
        name: 'Wallet Connection',
        status: 'error',
        message: 'Wallet not connected or service not initialized'
      });
      return;
    }

    setIsRunning(true);
    clearResults();

    // Test 1: Basic wallet info
    addResult({
      name: 'Wallet Info',
      status: 'success',
      message: `Connected: ${wallet?.adapter.name}`,
      data: {
        address: publicKey.toString(),
        walletName: wallet?.adapter.name
      }
    });

    // Test 2: RPC Connection
    try {
      const start = Date.now();
      const version = await connection.getVersion();
      const duration = Date.now() - start;
      
      addResult({
        name: 'RPC Connection',
        status: 'success',
        message: `Connected to Solana cluster (v${version['solana-core']})`,
        data: version,
        duration
      });
    } catch (error) {
      addResult({
        name: 'RPC Connection',
        status: 'error',
        message: `Failed to connect: ${error instanceof Error ? error.message : String(error)}`
      });
    }

    // Test 3: RPC Fallback Service
    try {
      const rpcFallback = RPCFallbackService.getInstance();
      const status = rpcFallback.getEndpointStatus();
      
      addResult({
        name: 'RPC Fallback Status',
        status: 'success',
        message: `${status.workingEndpoints.length} working endpoints`,
        data: status
      });
    } catch (error) {
      addResult({
        name: 'RPC Fallback Status',
        status: 'error',
        message: `Fallback service error: ${error instanceof Error ? error.message : String(error)}`
      });
    }

    // Test 4: SOL Balance
    try {
      const start = Date.now();
      const balance = await connection.getBalance(publicKey);
      const duration = Date.now() - start;
      const solBalance = balance / LAMPORTS_PER_SOL;
      
      addResult({
        name: 'SOL Balance (Direct)',
        status: 'success',
        message: `${solBalance.toFixed(6)} SOL`,
        data: { lamports: balance, sol: solBalance },
        duration
      });
    } catch (error) {
      addResult({
        name: 'SOL Balance (Direct)',
        status: 'error',
        message: `Failed: ${error instanceof Error ? error.message : String(error)}`
      });
    }

    // Test 5: SOL Balance via Fallback
    try {
      const start = Date.now();
      const rpcFallback = RPCFallbackService.getInstance();
      const balance = await rpcFallback.getWalletBalance(publicKey);
      const duration = Date.now() - start;
      const solBalance = balance / LAMPORTS_PER_SOL;
      
      addResult({
        name: 'SOL Balance (Fallback)',
        status: 'success',
        message: `${solBalance.toFixed(6)} SOL`,
        data: { lamports: balance, sol: solBalance },
        duration
      });
    } catch (error) {
      addResult({
        name: 'SOL Balance (Fallback)',
        status: 'error',
        message: `Failed: ${error instanceof Error ? error.message : String(error)}`
      });
    }

    // Test 6: Token Accounts (SPL)
    try {
      const start = Date.now();
      const tokenProgram = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: tokenProgram
      });
      const duration = Date.now() - start;
      
      addResult({
        name: 'SPL Token Accounts',
        status: 'success',
        message: `Found ${tokenAccounts.value.length} token accounts`,
        data: { count: tokenAccounts.value.length, accounts: tokenAccounts.value.slice(0, 3) },
        duration
      });
    } catch (error) {
      addResult({
        name: 'SPL Token Accounts',
        status: 'error',
        message: `Failed: ${error instanceof Error ? error.message : String(error)}`
      });
    }

    // Test 7: Token Accounts via Fallback
    try {
      const start = Date.now();
      const rpcFallback = RPCFallbackService.getInstance();
      const tokenProgram = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
      const tokenAccounts = await rpcFallback.getTokenAccounts(publicKey, tokenProgram);
      const duration = Date.now() - start;
      
      addResult({
        name: 'SPL Token Accounts (Fallback)',
        status: 'success',
        message: `Found ${tokenAccounts.value.length} token accounts`,
        data: { count: tokenAccounts.value.length, accounts: tokenAccounts.value.slice(0, 3) },
        duration
      });
    } catch (error) {
      addResult({
        name: 'SPL Token Accounts (Fallback)',
        status: 'error',
        message: `Failed: ${error instanceof Error ? error.message : String(error)}`
      });
    }

    // Test 8: Full Wallet Service
    try {
      const start = Date.now();
      const walletBalance = await walletService.getWalletBalances(publicKey);
      const duration = Date.now() - start;
      
      addResult({
        name: 'Wallet Service (Full)',
        status: 'success',
        message: `SOL: ${walletBalance.solBalance}, Tokens: ${walletBalance.tokenBalances.length}`,
        data: walletBalance,
        duration
      });
    } catch (error) {
      addResult({
        name: 'Wallet Service (Full)',
        status: 'error',
        message: `Failed: ${error instanceof Error ? error.message : String(error)}`,
        data: error instanceof RaydiumError ? error.details : undefined
      });
    }

    // Test 9: Wallet Service in Demo Mode
    try {
      const start = Date.now();
      walletService.setWalletMode('demo');
      const walletBalance = await walletService.getWalletBalances(publicKey);
      const duration = Date.now() - start;
      walletService.setWalletMode('real'); // Reset
      
      addResult({
        name: 'Wallet Service (Demo Mode)',
        status: 'success',
        message: `Demo data: SOL: ${walletBalance.solBalance}, Tokens: ${walletBalance.tokenBalances.length}`,
        data: walletBalance,
        duration
      });
    } catch (error) {
      addResult({
        name: 'Wallet Service (Demo Mode)',
        status: 'error',
        message: `Failed: ${error instanceof Error ? error.message : String(error)}`
      });
      walletService.setWalletMode('real'); // Reset
    }

    setIsRunning(false);
  }, [publicKey, walletService, connection, wallet, addResult, clearResults]);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <div className="h-5 w-5 bg-gray-500 rounded-full animate-pulse" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-500/20 bg-green-500/5';
      case 'error':
        return 'border-red-500/20 bg-red-500/5';
      case 'warning':
        return 'border-yellow-500/20 bg-yellow-500/5';
      default:
        return 'border-gray-500/20 bg-gray-500/5';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Wallet Diagnostics</h2>
          <p className="text-gray-400">Test wallet connectivity and data fetching</p>
        </div>
        <div className="flex items-center space-x-3">
          <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700" />
          <button
            onClick={runDiagnostics}
            disabled={!connected || isRunning}
            className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Running...' : 'Run Tests'}
          </button>
        </div>
      </div>

      {/* Connection Status */}
      {!connected && (
        <div className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700">
          <Wallet className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Wallet Not Connected</h3>
          <p className="text-gray-400">Connect your wallet to run diagnostics</p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Test Results</h3>
          {results.map((result, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <h4 className="font-medium text-white">{result.name}</h4>
                    <p className="text-sm text-gray-400">{result.message}</p>
                    {result.duration && (
                      <p className="text-xs text-gray-500 mt-1">
                        Completed in {result.duration}ms
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {result.data && (
                <details className="mt-3">
                  <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
                    Show details
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-900 p-3 rounded overflow-x-auto text-gray-300">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {results.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-500">
                {results.filter(r => r.status === 'success').length}
              </div>
              <div className="text-sm text-gray-400">Passed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-500">
                {results.filter(r => r.status === 'error').length}
              </div>
              <div className="text-sm text-gray-400">Failed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-500">
                {results.filter(r => r.status === 'warning').length}
              </div>
              <div className="text-sm text-gray-400">Warnings</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};