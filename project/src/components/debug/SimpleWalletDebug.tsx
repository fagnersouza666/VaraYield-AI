import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Bug } from 'lucide-react';

const SimpleWalletDebug: React.FC = () => {
  const { publicKey, connected } = useWallet();

  return (
    <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Bug className="h-6 w-6 text-yellow-500 mr-3" />
          <h2 className="text-xl font-semibold text-white">Simple Wallet Debug</h2>
        </div>
        <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700" />
      </div>

      <div className="space-y-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="font-medium text-white mb-2">Connection Status</h3>
          <p className="text-gray-300">
            Connected: {connected ? '✅ Yes' : '❌ No'}
          </p>
          {publicKey && (
            <p className="text-gray-300 mt-2">
              Address: {publicKey.toString()}
            </p>
          )}
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
              ✅ Wallet connected! Check the Portfolio tab to see if your tokens appear.
            </p>
            <p className="text-green-300 text-sm mt-2">
              If portfolio still shows zero, check the browser console (F12) for error messages.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleWalletDebug;