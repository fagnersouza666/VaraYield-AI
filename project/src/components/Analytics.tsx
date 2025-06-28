import React from 'react';
import { BarChart3, Activity, Target } from 'lucide-react';
import { useRaydiumData } from '../hooks/useRaydiumData';

const Analytics = () => {
  const { portfolioData } = useRaydiumData();

  const performanceData = [
    { period: '1D', value: '+1.2%', positive: true },
    { period: '1W', value: `+${portfolioData.weeklyChange.toFixed(1)}%`, positive: true },
    { period: '1M', value: '+8.7%', positive: true },
    { period: '3M', value: '+24.1%', positive: true },
    { period: '1Y', value: '+156.3%', positive: true },
  ];

  const strategiesData = [
    { name: 'Liquidity Provision', allocation: 45, apy: '12.5%', risk: 'Medium' },
    { name: 'Yield Farming', allocation: 30, apy: '18.2%', risk: 'High' },
    { name: 'Staking', allocation: 25, apy: '6.8%', risk: 'Low' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-green-400" />
          <span className="text-sm text-gray-400">Real-time data</span>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {performanceData.map((item, index) => (
          <div key={index} className="bg-gray-800 p-4 rounded-2xl border border-gray-700">
            <div className="text-center">
              <p className="text-gray-400 text-sm font-medium mb-2">{item.period}</p>
              <p className={`text-lg font-bold ${item.positive ? 'text-green-400' : 'text-red-400'}`}>
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Strategy Breakdown */}
      <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Strategy Breakdown</h2>
            <Target className="h-6 w-6 text-indigo-400" />
          </div>
          <div className="space-y-4">
            {strategiesData.map((strategy, index) => (
              <div key={index} className="p-4 bg-gray-700/50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">{strategy.name}</h3>
                  <span className="text-sm text-gray-400">{strategy.allocation}% allocation</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">APY</span>
                  <span className="text-sm font-semibold text-green-400">{strategy.apy}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">Risk Level</span>
                  <span className={`text-sm font-medium ${
                    strategy.risk === 'Low' ? 'text-green-400' :
                    strategy.risk === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {strategy.risk}
                  </span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${strategy.allocation}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Protocol Performance Chart */}
      <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Protocol Performance</h2>
            <BarChart3 className="h-6 w-6 text-indigo-400" />
          </div>
          <div className="space-y-4">
            {portfolioData.protocols.map((protocol, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">{protocol.name[0]}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{protocol.name}</h3>
                    <p className="text-sm text-gray-400">DeFi Protocol</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">{protocol.apy}</p>
                  <p className={`text-sm ${protocol.positive ? 'text-green-400' : 'text-red-400'}`}>
                    {protocol.change} 24h
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

export default Analytics;