import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, AlertTriangle } from 'lucide-react';
import { PortfolioSummary } from '../../services/types/portfolio.types';

interface PortfolioOverviewProps {
  readonly summary: PortfolioSummary;
}

export const PortfolioOverview: React.FC<PortfolioOverviewProps> = React.memo(({ summary }) => {
  const formatCurrency = useMemo(() => (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  }, []);

  const formatPercentage = useMemo(() => (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  }, []);

  const getTrendIcon = useMemo(() => (value: number) => {
    return value >= 0 ? TrendingUp : TrendingDown;
  }, []);

  const getTrendColor = useMemo(() => (value: number) => {
    return value >= 0 ? 'text-green-400' : 'text-red-400';
  }, []);

  const cards = useMemo(() => [
    {
      title: 'Total Portfolio Value',
      value: formatCurrency(summary.totalValue),
      change: formatCurrency(summary.dailyChange),
      changePercent: formatPercentage(summary.dailyChangePercentage),
      isPositive: summary.dailyChange >= 0,
      icon: DollarSign,
      bgGradient: 'from-blue-600 to-blue-700',
    },
    {
      title: 'Total P&L',
      value: formatCurrency(summary.totalPnl),
      change: '',
      changePercent: formatPercentage(summary.totalPnlPercentage),
      isPositive: summary.totalPnl >= 0,
      icon: BarChart3,
      bgGradient: summary.totalPnl >= 0 ? 'from-green-600 to-green-700' : 'from-red-600 to-red-700',
    },
    {
      title: 'Weekly Performance',
      value: formatCurrency(summary.weeklyChange),
      change: '',
      changePercent: formatPercentage(summary.weeklyChangePercentage),
      isPositive: summary.weeklyChange >= 0,
      icon: TrendingUp,
      bgGradient: 'from-purple-600 to-purple-700',
    },
    {
      title: 'Monthly Performance',
      value: formatCurrency(summary.monthlyChange),
      change: '',
      changePercent: formatPercentage(summary.monthlyChangePercentage),
      isPositive: summary.monthlyChange >= 0,
      icon: BarChart3,
      bgGradient: 'from-indigo-600 to-indigo-700',
    },
  ], [summary, formatCurrency, formatPercentage]);

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const IconComponent = card.icon;
          const TrendIcon = getTrendIcon(card.isPositive ? 1 : -1);
          
          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${card.bgGradient} p-6 rounded-xl shadow-lg text-white`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white/90 text-sm font-medium">{card.title}</h3>
                <IconComponent className="h-5 w-5 text-white/90" />
              </div>
              
              <div className="space-y-2">
                <p className="text-2xl font-bold">{card.value}</p>
                
                {card.changePercent && (
                  <div className={`flex items-center text-sm ${getTrendColor(card.isPositive ? 1 : -1)}`}>
                    <TrendIcon className="h-4 w-4 mr-1" />
                    <span>{card.changePercent}</span>
                    {card.change && <span className="ml-1">({card.change})</span>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Info */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Portfolio Summary</h3>
          <div className="flex items-center text-sm text-gray-400">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Last updated: {new Date(summary.lastUpdated).toLocaleString()}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{summary.totalPositions}</p>
            <p className="text-sm text-gray-400">Active Positions</p>
          </div>
          
          <div className="text-center">
            <p className={`text-2xl font-bold ${getTrendColor(summary.totalPnl)}`}>
              {formatPercentage(summary.totalPnlPercentage)}
            </p>
            <p className="text-sm text-gray-400">Total Return</p>
          </div>
          
          <div className="text-center">
            <p className={`text-2xl font-bold ${getTrendColor(summary.dailyChangePercentage)}`}>
              {formatPercentage(summary.dailyChangePercentage)}
            </p>
            <p className="text-sm text-gray-400">24h Change</p>
          </div>
        </div>
      </div>
    </div>
  );
});

PortfolioOverview.displayName = 'PortfolioOverview';