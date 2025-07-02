import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  AlertCircle,
  Zap,
  Shield,
  BarChart3,
  RefreshCw,
  Bell,
  Filter
} from 'lucide-react';
import { usePoolAnalyticsDashboard, useNewPoolMonitoring, useOptimalPools } from '../../hooks/queries/usePoolAnalytics';
import { PoolMetrics } from '../../services/api/pool-analytics.service';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';

const PoolAnalyticsDashboard: React.FC = () => {
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [targetAmount, setTargetAmount] = useState<number>(10000);
  const [monitoringEnabled, setMonitoringEnabled] = useState(false);
  const [showOptimalPools, setShowOptimalPools] = useState(false);

  const {
    analytics,
    isLoading,
    isRefreshing,
    error,
    refreshAnalytics,
    lastUpdated
  } = usePoolAnalyticsDashboard();

  const {
    newPoolAlerts,
    isMonitoring,
    clearAlerts,
    requestNotificationPermission,
    alertCount,
    latestAlert
  } = useNewPoolMonitoring(monitoringEnabled);

  const {
    data: optimalPools,
    isLoading: isLoadingOptimal
  } = useOptimalPools(targetAmount, selectedRiskLevel, 5, showOptimalPools);

  const handleStartMonitoring = async () => {
    const notificationGranted = await requestNotificationPermission();
    if (notificationGranted) {
      setMonitoringEnabled(true);
    } else {
      alert('Please enable notifications to receive new pool alerts');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading pool analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorMessage
          error={error}
          title="Pool Analytics Error"
          onRetry={refreshAnalytics}
          showDetails={true}
        />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-8">
        <ErrorMessage
          title="No Pool Data"
          message="Unable to load pool analytics information"
          onRetry={refreshAnalytics}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Pool Analytics</h1>
          <p className="text-gray-400 mt-1">
            Real-time liquidity pool performance and optimization
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshAnalytics}
            className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={isMonitoring ? () => setMonitoringEnabled(false) : handleStartMonitoring}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              isMonitoring 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Bell className="h-4 w-4 mr-2" />
            {isMonitoring ? 'Monitoring Active' : 'Start Monitoring'}
            {alertCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                {alertCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total TVL</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(analytics.totalTVL)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">24h Volume</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(analytics.totalVolume24h)}
              </p>
            </div>
            <Activity className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">24h Fees</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(analytics.totalFees24h)}
              </p>
            </div>
            <Zap className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Average APY</p>
              <p className="text-2xl font-bold text-white">
                {analytics.averageAPY.toFixed(2)}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* New Pool Alerts */}
      {latestAlert && (
        <div className="bg-blue-900/20 border border-blue-500/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-400">Latest Pool Alert</h3>
            <button
              onClick={clearAlerts}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Clear All ({alertCount})
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Token Pair</p>
              <p className="text-white font-medium">{latestAlert.tokenPair}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Initial Liquidity</p>
              <p className="text-white font-medium">{formatCurrency(latestAlert.initialLiquidity)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Potential APY</p>
              <p className="text-green-400 font-medium">{latestAlert.potentialAPY.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Risk Score</p>
              <p className="text-yellow-400 font-medium">{latestAlert.riskScore.toFixed(0)}/100</p>
            </div>
          </div>
        </div>
      )}

      {/* Pool Optimizer */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Pool Optimizer</h3>
          <Filter className="h-5 w-5 text-gray-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Target Amount ($)
            </label>
            <input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              placeholder="10000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Risk Tolerance
            </label>
            <select
              value={selectedRiskLevel}
              onChange={(e) => setSelectedRiskLevel(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setShowOptimalPools(true)}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              disabled={isLoadingOptimal}
            >
              {isLoadingOptimal ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Find Optimal Pools'
              )}
            </button>
          </div>
        </div>

        {optimalPools && optimalPools.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-white">Recommended Pools:</h4>
            {optimalPools.slice(0, 5).map((pool, index) => (
              <div key={pool.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-gray-400">#{index + 1}</span>
                  <div>
                    <p className="text-white font-medium">{pool.tokenA.symbol}-{pool.tokenB.symbol}</p>
                    <p className="text-gray-400 text-sm">TVL: {formatCurrency(pool.tvl)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-medium">{pool.apy.toFixed(2)}% APY</p>
                  <p className="text-gray-400 text-sm">LP Burn: {pool.lpBurnPercentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Performers */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Top Performing Pools</h3>
          <BarChart3 className="h-5 w-5 text-gray-400" />
        </div>

        <div className="space-y-4">
          {analytics.topPerformers.map((pool, index) => (
            <div key={pool.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-4">
                <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-medium">
                  {index + 1}
                </span>
                <div>
                  <p className="text-white font-medium">{pool.tokenA.symbol}-{pool.tokenB.symbol}</p>
                  <p className="text-gray-400 text-sm">{pool.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-white font-medium">{formatCurrency(pool.tvl)}</p>
                  <p className="text-gray-400 text-sm">TVL</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-medium">{pool.apy.toFixed(2)}%</p>
                  <p className="text-gray-400 text-sm">APY</p>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${pool.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatPercent(pool.priceChange24h)}
                  </p>
                  <p className="text-gray-400 text-sm">24h</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {['lowRisk', 'mediumRisk', 'highRisk'].map((riskLevel) => {
          const pools = analytics.riskMetrics[riskLevel as keyof typeof analytics.riskMetrics];
          const riskName = riskLevel.replace('Risk', '');
          
          return (
            <div key={riskLevel} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white capitalize">{riskName} Risk Pools</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskBadgeColor(riskName)}`}>
                  {pools.length} pools
                </span>
              </div>

              <div className="space-y-3">
                {pools.slice(0, 3).map((pool) => (
                  <div key={pool.id} className="p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-medium text-sm">{pool.tokenA.symbol}-{pool.tokenB.symbol}</p>
                      <p className="text-green-400 text-sm">{pool.apy.toFixed(1)}%</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>TVL: {formatCurrency(pool.tvl)}</span>
                      <span>LP Burn: {pool.lpBurnPercentage.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
                
                {pools.length > 3 && (
                  <p className="text-gray-400 text-sm text-center">
                    +{pools.length - 3} more pools
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Last Updated */}
      <div className="text-center text-gray-500 text-sm">
        Last updated: {new Date(lastUpdated).toLocaleString()}
      </div>
    </div>
  );
};

export default PoolAnalyticsDashboard;