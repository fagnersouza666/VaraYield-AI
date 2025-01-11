import React from 'react';
import { BarChart3 } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Header = () => {
  const { wallet } = useWallet();

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Vara Yield Optimizer</h1>
              <p className="text-sm text-gray-400">Powered by AI</p>
            </div>
          </div>
          <WalletMultiButton className="!bg-indigo-600 hover:!bg-indigo-700 text-white px-6 py-2.5 rounded-xl transition-colors shadow-lg shadow-indigo-900/20 font-medium" />
        </div>
      </div>
    </header>
  );
};

export default Header;