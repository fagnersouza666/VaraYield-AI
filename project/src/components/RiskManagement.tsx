import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Settings } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const RiskManagement = () => {
  const { riskLevel, setRiskLevel } = useAppStore();

  const riskProfiles = [
    {
      level: 'low' as const,
      title: 'Conservative',
      description: 'Lower risk, stable returns with established protocols',
      targetAPY: '4-8%',
      maxDrawdown: '5%',
      protocols: ['Marinade', 'Solend'],
      color: 'green'
    },
    {
      level: 'medium' as const,
      title: 'Balanced',
      description: 'Moderate risk with diversified yield strategies',
      targetAPY: '8-15%',
      maxDrawdown: '15%',
      protocols: ['Raydium', 'Orca', 'Marinade'],
      color: 'yellow'
    },
    {
      level: 'high' as const,
      title: 'Aggressive',
      description: 'Higher risk, maximum yield potential',
      targetAPY: '15-25%',
      maxDrawdown: '30%',
      protocols: ['All available protocols'],
      color: 'red'
    }
  ];

  const riskMetrics = [
    { label: 'Value at Risk (VaR)', value: '$2,450', status: 'normal' },
    { label: 'Portfolio Beta', value: '1.23', status: 'warning' },
    { label: 'Sharpe Ratio', value: '1.89', status: 'good' },
    { label: 'Max Drawdown', value: '12.3%', status: 'normal' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'danger': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Risk Management</h1>
        <Shield className="h-6 w-6 text-indigo-400" />
      </div>

      {/* Current Risk Profile */}
      <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Risk Profile Selection</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {riskProfiles.map((profile) => (
            <div
              key={profile.level}
              className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                riskLevel === profile.level
                  ? 'border-indigo-500 bg-indigo-500/10' 
                  : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
              }`}
              onClick={() => setRiskLevel(profile.level)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">{profile.title}</h3>
                <div className={`w-4 h-4 rounded-full ${
                  profile.color === 'green' ? 'bg-green-400' :
                  profile.color === 'yellow' ? 'bg-yellow-400' : 'bg-red-400'
                }`}></div>
              </div>
              <p className="text-gray-400 text-sm mb-4">{profile.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Target APY:</span>
                  <span className="text-white text-sm font-medium">{profile.targetAPY}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Max Drawdown:</span>
                  <span className="text-white text-sm font-medium">{profile.maxDrawdown}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Risk Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {riskMetrics.map((metric, index) => (
            <div key={index} className="p-4 bg-gray-700/50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-400 text-sm font-medium">{metric.label}</h3>
                {metric.status === 'good' && <CheckCircle className="h-4 w-4 text-green-400" />}
                {metric.status === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-400" />}
                {metric.status === 'danger' && <AlertTriangle className="h-4 w-4 text-red-400" />}
              </div>
              <p className={`text-lg font-bold ${getStatusColor(metric.status)}`}>
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Settings */}
      <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Risk Settings</h2>
          <Settings className="h-6 w-6 text-indigo-400" />
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl">
            <div>
              <h3 className="font-semibold text-white">Stop Loss</h3>
              <p className="text-sm text-gray-400">Automatically exit positions at loss threshold</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl">
            <div>
              <h3 className="font-semibold text-white">Rebalancing Alerts</h3>
              <p className="text-sm text-gray-400">Get notified when portfolio needs rebalancing</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl">
            <div>
              <h3 className="font-semibold text-white">Auto-Optimization</h3>
              <p className="text-sm text-gray-400">Allow AI to automatically optimize positions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskManagement;