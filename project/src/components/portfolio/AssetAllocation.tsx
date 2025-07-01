import React, { useMemo } from 'react';
import { PieChart, MoreHorizontal } from 'lucide-react';
import { Position } from '../../services/types/portfolio.types';

interface AssetAllocationProps {
  readonly positions: Position[];
}

export const AssetAllocation: React.FC<AssetAllocationProps> = React.memo(({ positions }) => {
  const allocationData = useMemo(() => {
    return positions
      .map(position => ({
        id: position.id,
        symbol: position.asset.symbol,
        name: position.asset.name,
        allocation: position.allocation,
        value: position.value,
        color: getColorForAsset(position.asset.symbol),
      }))
      .sort((a, b) => b.allocation - a.allocation);
  }, [positions]);

  const formatCurrency = useMemo(() => (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  const totalValue = useMemo(() => {
    return positions.reduce((sum, position) => sum + position.value, 0);
  }, [positions]);

  // Simple pie chart calculation for visual representation
  const pieSegments = useMemo(() => {
    let cumulativePercentage = 0;
    
    return allocationData.map(item => {
      const segment = {
        ...item,
        startAngle: cumulativePercentage * 3.6, // Convert to degrees
        endAngle: (cumulativePercentage + item.allocation) * 3.6,
      };
      cumulativePercentage += item.allocation;
      return segment;
    });
  }, [allocationData]);

  if (positions.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center mb-6">
          <PieChart className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-semibold text-white">Asset Allocation</h3>
        </div>
        
        <div className="text-center py-8">
          <p className="text-gray-400">No positions found</p>
          <p className="text-sm text-gray-500 mt-2">Add your first position to see allocation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <PieChart className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-semibold text-white">Asset Allocation</h3>
        </div>
        <button className="text-gray-400 hover:text-white">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart Visualization */}
        <div className="flex items-center justify-center">
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {pieSegments.map((segment, index) => {
                const radius = 40;
                const circumference = 2 * Math.PI * radius;
                const strokeDasharray = (segment.allocation / 100) * circumference;
                const strokeDashoffset = circumference - strokeDasharray;
                const rotation = (segment.startAngle - 90) * (Math.PI / 180);
                
                return (
                  <circle
                    key={segment.id}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke={segment.color}
                    strokeWidth="8"
                    strokeDasharray={`${strokeDasharray} ${circumference - strokeDasharray}`}
                    strokeDashoffset={strokeDashoffset}
                    transform={`rotate(${segment.startAngle} 50 50)`}
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>
            
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-bold text-white">{formatCurrency(totalValue)}</p>
                <p className="text-xs text-gray-400">Total Value</p>
              </div>
            </div>
          </div>
        </div>

        {/* Allocation List */}
        <div className="space-y-3">
          {allocationData.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <div>
                  <p className="font-medium text-white">{item.symbol}</p>
                  <p className="text-xs text-gray-400">{item.name}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-medium text-white">{item.allocation.toFixed(1)}%</p>
                <p className="text-xs text-gray-400">{formatCurrency(item.value)}</p>
              </div>
            </div>
          ))}
          
          {allocationData.length > 5 && (
            <button className="w-full text-sm text-blue-400 hover:text-blue-300 py-2">
              View All Assets
            </button>
          )}
        </div>
      </div>

      {/* Allocation Summary */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-white">{allocationData.length}</p>
            <p className="text-xs text-gray-400">Assets</p>
          </div>
          <div>
            <p className="text-lg font-bold text-green-400">
              {allocationData.filter(item => item.allocation >= 10).length}
            </p>
            <p className="text-xs text-gray-400">Major Holdings</p>
          </div>
          <div>
            <p className="text-lg font-bold text-blue-400">
              {(allocationData[0]?.allocation || 0).toFixed(1)}%
            </p>
            <p className="text-xs text-gray-400">Largest Position</p>
          </div>
        </div>
      </div>
    </div>
  );
});

AssetAllocation.displayName = 'AssetAllocation';

// Helper function to get colors for different assets
function getColorForAsset(symbol: string): string {
  const colors: Record<string, string> = {
    SOL: '#14F195',
    USDC: '#2775CA',
    RAY: '#C23AC4',
    BTC: '#F7931A',
    ETH: '#627EEA',
    USDT: '#26A17B',
    SRM: '#00FFA3',
    FTT: '#02A8D8',
    BNB: '#F3BA2F',
    ADA: '#0033AD',
  };
  
  return colors[symbol] || `hsl(${Math.abs(hashCode(symbol)) % 360}, 70%, 50%)`;
}

// Simple hash function for consistent colors
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}