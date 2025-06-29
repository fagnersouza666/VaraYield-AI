import React from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';
import { useRaydiumData } from '../hooks/useRaydiumData';
import { useAppStore } from '../store/useAppStore';
import { logger } from '../shared/logger';
import { RISK_LEVELS } from '../shared/constants';

const Dashboard: React.FC = () => {
  const { portfolioData, loading, optimizePortfolio } = useRaydiumData();
  const { riskLevel, setRiskLevel, isOptimizing, setOptimizing, lastOptimizationTime, nextRebalanceTime, updateOptimizationTimes } = useAppStore();
  
  const handleOptimize = async (): Promise<void> => {
    try {
      setOptimizing(true);
      logger.info('User initiated portfolio optimization');
      
      const result = await optimizePortfolio();
      if (result) {
        updateOptimizationTimes(result.lastOptimized, result.nextRebalance);
        logger.info('Portfolio optimization completed successfully');
      }
    } catch (error) {
      logger.error('Portfolio optimization failed', { 
        error: error instanceof Error ? error.message : String(error) 
      });
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-white/90 text-sm font-medium">Total Value Locked</h3>
            <TrendingUp className="h-5 w-5 text-white/90" />
          </div>
          <p className="mt-3 text-3xl font-bold text-white">${portfolioData.totalValueLocked.toLocaleString()}</p>
          <p className="mt-2 text-sm text-white/90 flex items-center">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            +{portfolioData.weeklyChange.toFixed(1)}% from last week
          </p>
        </div>

        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-400 text-sm font-medium">Current APY</h3>
            <div className="bg-green-900/30 rounded-full p-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-white">{portfolioData.currentAPY.toFixed(2)}%</p>
          <p className="mt-2 text-sm text-green-400">Optimized returns</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">Risk Level</h3>
          </div>
          <div className="flex space-x-3">
            {RISK_LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => setRiskLevel(level)}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  riskLevel === level
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Protocol Performance */}
      <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Protocol Performance</h2>
            <div className="flex space-x-2">
              <span className="px-3 py-1 text-xs font-medium bg-green-900/30 text-green-400 rounded-full">Live Data</span>
            </div>
          </div>
          <div className="overflow-hidden">
            <div className="grid grid-cols-3 gap-4 mb-4 px-4 py-3 bg-gray-700/50 rounded-xl">
              <div className="text-sm font-medium text-gray-300">Protocol</div>
              <div className="text-sm font-medium text-gray-300">Current APY</div>
              <div className="text-sm font-medium text-gray-300">24h Change</div>
            </div>
            <div className="space-y-2">
              {portfolioData.protocols.map((protocol, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 gap-4 px-4 py-4 hover:bg-gray-700/30 transition-colors rounded-xl"
                >
                  <div className="text-sm font-medium text-gray-200">{protocol.name}</div>
                  <div className="text-sm text-gray-200 font-semibold">{protocol.apy}</div>
                  <div className={`text-sm flex items-center font-medium ${
                    protocol.positive ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {protocol.positive ? (
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 mr-1" />
                    )}
                    {protocol.change}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Optimization Status */}
      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">AI Optimization Status</h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-400 flex items-center">
                <span className="w-32">Next rebalance:</span>
                <span className="font-medium text-gray-200">{nextRebalanceTime}</span>
              </p>
              <p className="text-sm text-gray-400 flex items-center">
                <span className="w-32">Last optimized:</span>
                <span className="font-medium text-gray-200">{lastOptimizationTime}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={handleOptimize}
            disabled={isOptimizing || loading}
            className="flex items-center bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-900/20"
          >
            <Zap className={`h-5 w-5 mr-2 ${isOptimizing ? 'animate-spin' : ''}`} />
            {isOptimizing ? 'Optimizing...' : 'Optimize Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;