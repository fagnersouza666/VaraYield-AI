import React, { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
import { Bug, RefreshCw, AlertCircle, CheckCircle, Copy } from 'lucide-react';
import { SolanaWalletService } from '../../services/api/wallet.service';
import { WalletPortfolioService } from '../../services/api/wallet-portfolio.service';

const WalletDebug: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [debugResults, setDebugResults] = useState<any>(null);
  const [isDebugging, setIsDebugging] = useState(false);
  const [debugStep, setDebugStep] = useState('');

  const runDebug = async () => {
    if (!connected || !publicKey) {
      setDebugResults({ error: 'Wallet not connected' });
      return;
    }

    setIsDebugging(true);
    setDebugResults(null);
    const walletService = new SolanaWalletService(connection);
    const portfolioService = new WalletPortfolioService(walletService, publicKey);

    try {
      const results: any = {
        connection: {},
        wallet: {},
        tokens: {},
        portfolio: {},
        errors: []
      };

      // Test 1: Connection
      setDebugStep('Testing connection...');
      try {
        const version = await connection.getVersion();
        const slot = await connection.getSlot();
        results.connection = {
          status: 'success',
          version,
          slot,
          rpcEndpoint: connection.rpcEndpoint
        };
      } catch (error) {
        results.connection = {
          status: 'error',
          error: error instanceof Error ? error.message : String(error)
        };
        results.errors.push('Connection failed');
      }

      // Test 2: Wallet
      setDebugStep('Testing wallet...');
      try {
        const balance = await connection.getBalance(publicKey);
        results.wallet = {
          status: 'success',
          publicKey: publicKey.toString(),
          solBalance: balance / 1e9,
          network: connection.rpcEndpoint.includes('devnet') ? 'devnet' : 'mainnet'
        };
      } catch (error) {
        results.wallet = {
          status: 'error',
          error: error instanceof Error ? error.message : String(error)
        };
        results.errors.push('Wallet balance failed');
      }

      // Test 3: Token Accounts
      setDebugStep('Fetching token accounts...');
      try {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
        );
        
        const token2022Accounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          { programId: new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb') }
        );

        results.tokens = {
          status: 'success',
          splTokens: tokenAccounts.value.length,
          token2022: token2022Accounts.value.length,
          total: tokenAccounts.value.length + token2022Accounts.value.length,
          accounts: [...tokenAccounts.value, ...token2022Accounts.value].map(acc => {
            const parsedData = acc.account.data as any;
            const tokenInfo = parsedData?.parsed?.info;
            return {
              pubkey: acc.pubkey.toString(),
              mint: tokenInfo?.mint,
              balance: tokenInfo?.tokenAmount?.amount,
              uiAmount: tokenInfo?.tokenAmount?.uiAmount,
              decimals: tokenInfo?.tokenAmount?.decimals
            };
          })
        };
      } catch (error) {
        results.tokens = {
          status: 'error',
          error: error instanceof Error ? error.message : String(error)
        };
        results.errors.push('Token accounts failed');
      }

      // Test 4: Wallet Service
      setDebugStep('Testing wallet service...');
      try {
        const walletBalance = await walletService.getWalletBalances(publicKey);
        results.walletService = {
          status: 'success',
          solBalance: walletBalance.solBalance,
          tokenCount: walletBalance.tokenBalances.length,
          totalValue: walletBalance.totalValue,
          tokens: walletBalance.tokenBalances.map(t => ({
            symbol: t.symbol,
            mint: t.mint.slice(0, 8) + '...',
            balance: t.uiAmount,
            value: t.value || 0
          }))
        };
      } catch (error) {
        results.walletService = {
          status: 'error',
          error: error instanceof Error ? error.message : String(error)
        };
        results.errors.push('Wallet service failed');
      }

      // Test 5: Portfolio Service
      setDebugStep('Testing portfolio service...');
      try {
        const portfolio = await portfolioService.getPortfolio();
        results.portfolioService = {
          status: 'success',
          totalValue: portfolio.summary.totalValue,
          positionCount: portfolio.positions.length,
          positions: portfolio.positions.map(p => ({
            symbol: p.asset.symbol,
            quantity: p.quantity,
            value: p.value,
            allocation: p.allocation
          }))
        };
      } catch (error) {
        results.portfolioService = {
          status: 'error',
          error: error instanceof Error ? error.message : String(error)
        };
        results.errors.push('Portfolio service failed');
      }

      setDebugResults(results);
    } catch (error) {
      setDebugResults({
        error: 'Debug failed',
        details: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsDebugging(false);
      setDebugStep('');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(debugResults, null, 2));
  };

  return (
    <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Bug className="h-6 w-6 text-yellow-500 mr-3" />
          <h2 className="text-xl font-semibold text-white">Wallet Debug Tool</h2>
        </div>
        <div className="flex items-center space-x-3">
          <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700" />
          <button
            onClick={runDebug}
            disabled={!connected || isDebugging}
            className="flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isDebugging ? 'animate-spin' : ''}`} />
            {isDebugging ? 'Debugging...' : 'Run Debug'}
          </button>
        </div>
      </div>

      {!connected && (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-400">Connect your wallet to run diagnostics</p>
        </div>
      )}

      {isDebugging && (
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 text-blue-500 mx-auto mb-4 animate-spin" />
          <p className="text-blue-400">{debugStep}</p>
        </div>
      )}

      {debugResults && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Debug Results</h3>
            <button
              onClick={copyToClipboard}
              className="flex items-center px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </button>
          </div>

          {debugResults.error ? (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="font-medium text-red-400">Error</span>
              </div>
              <p className="text-red-300">{debugResults.error}</p>
              {debugResults.details && (
                <p className="text-red-300 text-sm mt-2">{debugResults.details}</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Connection Status */}
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  {debugResults.connection?.status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span className="font-medium text-white">Connection</span>
                </div>
                <div className="text-sm text-gray-300">
                  <p>RPC: {debugResults.connection?.rpcEndpoint}</p>
                  <p>Slot: {debugResults.connection?.slot}</p>
                </div>
              </div>

              {/* Wallet Status */}
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  {debugResults.wallet?.status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span className="font-medium text-white">Wallet</span>
                </div>
                <div className="text-sm text-gray-300">
                  <p>Network: {debugResults.wallet?.network}</p>
                  <p>SOL Balance: {debugResults.wallet?.solBalance}</p>
                </div>
              </div>

              {/* Token Accounts */}
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  {debugResults.tokens?.status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span className="font-medium text-white">Token Accounts</span>
                </div>
                <div className="text-sm text-gray-300">
                  <p>SPL Tokens: {debugResults.tokens?.splTokens}</p>
                  <p>Token-2022: {debugResults.tokens?.token2022}</p>
                  <p>Total: {debugResults.tokens?.total}</p>
                </div>
              </div>

              {/* Wallet Service */}
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  {debugResults.walletService?.status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span className="font-medium text-white">Wallet Service</span>
                </div>
                <div className="text-sm text-gray-300">
                  <p>Token Count: {debugResults.walletService?.tokenCount}</p>
                  <p>Total Value: ${debugResults.walletService?.totalValue?.toFixed(2) || '0'}</p>
                  {debugResults.walletService?.tokens?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-gray-400">Tokens found:</p>
                      {debugResults.walletService.tokens.map((token: any, i: number) => (
                        <p key={i} className="ml-2 text-xs">
                          {token.symbol}: {token.balance} (${token.value.toFixed(2)})
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Portfolio Service */}
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  {debugResults.portfolioService?.status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span className="font-medium text-white">Portfolio Service</span>
                </div>
                <div className="text-sm text-gray-300">
                  <p>Position Count: {debugResults.portfolioService?.positionCount}</p>
                  <p>Total Value: ${debugResults.portfolioService?.totalValue?.toFixed(2) || '0'}</p>
                </div>
              </div>

              {/* Raw Data */}
              <details className="bg-gray-700 rounded-lg p-4">
                <summary className="font-medium text-white cursor-pointer">Raw Debug Data</summary>
                <pre className="mt-2 text-xs text-gray-300 overflow-auto max-h-64">
                  {JSON.stringify(debugResults, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletDebug;