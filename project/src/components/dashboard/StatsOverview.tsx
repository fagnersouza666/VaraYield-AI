import React from 'react';
import { TrendingUp, ArrowUpRight } from 'lucide-react';
import type { PortfolioData } from '../../types';

interface StatsOverviewProps {
  readonly portfolioData: PortfolioData;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ portfolioData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Total Value Locked */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-white/90 text-sm font-medium">Total Value Locked</h3>
          <TrendingUp className="h-5 w-5 text-white/90" />
        </div>
        <p className="mt-3 text-3xl font-bold text-white">
          ${portfolioData.totalValueLocked.toLocaleString()}
        </p>
        <p className="mt-2 text-sm text-white/90 flex items-center">
          <ArrowUpRight className="h-4 w-4 mr-1" />
          +{portfolioData.weeklyChange.toFixed(1)}% from last week
        </p>
      </div>

      {/* Current APY */}
      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-400 text-sm font-medium">Current APY</h3>
          <div className="bg-green-900/30 rounded-full p-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
          </div>
        </div>
        <p className="mt-3 text-3xl font-bold text-white">
          {portfolioData.currentAPY.toFixed(2)}%
        </p>
        <p className="mt-2 text-sm text-green-400">Optimized returns</p>
      </div>

      {/* Risk Level */}
      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-400 text-sm font-medium">Risk Level</h3>
        </div>
        <div className="flex space-x-3">
          <span className="text-2xl font-bold text-white">Medium</span>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;