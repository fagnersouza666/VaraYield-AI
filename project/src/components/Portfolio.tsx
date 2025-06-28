import React from 'react';
import { Wallet, TrendingUp, DollarSign, PieChart } from 'lucide-react';
import { useRaydiumData } from '../hooks/useRaydiumData';

const Portfolio = () => {
  const { portfolioData, connected } = useRaydiumData();

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Wallet className="h-16 w-16 text-gray-500 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h2>
        <p className="text-gray-400">Please connect your wallet to view your portfolio</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Portfolio</h1>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm text-gray-400">Live</span>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">Total Balance</h3>
            <DollarSign className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-white">${portfolioData.totalValueLocked.toLocaleString()}</p>
          <p className="text-sm text-green-400">+{portfolioData.weeklyChange.toFixed(1)}% this week</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">Portfolio APY</h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-white">{portfolioData.currentAPY.toFixed(2)}%</p>
          <p className="text-sm text-green-400">Optimized</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">Active Positions</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-white">{portfolioData.protocols.length}</p>
          <p className="text-sm text-gray-400">Protocols</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">Weekly Yield</h3>
            <TrendingUp className="h-5 w-5 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            ${(portfolioData.totalValueLocked * portfolioData.currentAPY / 100 / 52).toFixed(2)}
          </p>
          <p className="text-sm text-gray-400">Estimated</p>
        </div>
      </div>

      {/* Holdings */}
      <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Holdings</h2>
          <div className="space-y-4">
            {portfolioData.protocols.map((protocol, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">{protocol.name[0]}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{protocol.name}</h3>
                    <p className="text-sm text-gray-400">Liquidity Pool</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">
                    ${(portfolioData.totalValueLocked / portfolioData.protocols.length).toFixed(2)}
                  </p>
                  <p className={`text-sm ${protocol.positive ? 'text-green-400' : 'text-red-400'}`}>
                    {protocol.apy} APY
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;