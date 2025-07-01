import React, { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, MoreVertical, Edit, Trash2, ExternalLink } from 'lucide-react';
import { Position } from '../../services/types/portfolio.types';

interface PositionsListProps {
  readonly positions: Position[];
  readonly onEditPosition?: (position: Position) => void;
  readonly onRemovePosition?: (positionId: string) => void;
  readonly isLoading?: boolean;
}

type SortField = 'symbol' | 'value' | 'allocation' | 'pnl' | 'performance';
type SortOrder = 'asc' | 'desc';

export const PositionsList: React.FC<PositionsListProps> = React.memo(({
  positions,
  onEditPosition,
  onRemovePosition,
  isLoading = false,
}) => {
  const [sortField, setSortField] = useState<SortField>('value');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [expandedPosition, setExpandedPosition] = useState<string | null>(null);

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

  const sortedPositions = useMemo(() => {
    return [...positions].sort((a, b) => {
      let valueA: number;
      let valueB: number;

      switch (sortField) {
        case 'symbol':
          return sortOrder === 'asc' 
            ? a.asset.symbol.localeCompare(b.asset.symbol)
            : b.asset.symbol.localeCompare(a.asset.symbol);
        
        case 'value':
          valueA = a.value;
          valueB = b.value;
          break;
          
        case 'allocation':
          valueA = a.allocation;
          valueB = b.allocation;
          break;
          
        case 'pnl':
          valueA = a.pnl;
          valueB = b.pnl;
          break;
          
        case 'performance':
          valueA = a.pnlPercentage;
          valueB = b.pnlPercentage;
          break;
          
        default:
          valueA = a.value;
          valueB = b.value;
      }

      return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
    });
  }, [positions, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const SortableHeader: React.FC<{ field: SortField; children: React.ReactNode; className?: string }> = ({ 
    field, 
    children, 
    className = '' 
  }) => (
    <th 
      className={`px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field && (
          <span className="text-blue-400">
            {sortOrder === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  );

  const PositionRow: React.FC<{ position: Position; index: number }> = React.memo(({ position, index }) => {
    const isExpanded = expandedPosition === position.id;
    const isProfitable = position.pnl >= 0;

    return (
      <>
        <tr 
          className="hover:bg-gray-700/50 transition-colors border-b border-gray-700"
          key={position.id}
        >
          {/* Asset */}
          <td className="px-4 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {position.asset.symbol.slice(0, 2)}
                </span>
              </div>
              <div>
                <p className="font-medium text-white">{position.asset.symbol}</p>
                <p className="text-xs text-gray-400">{position.asset.name}</p>
              </div>
            </div>
          </td>

          {/* Quantity & Value */}
          <td className="px-4 py-4">
            <div>
              <p className="font-medium text-white">{position.quantity.toLocaleString()}</p>
              <p className="text-xs text-gray-400">{formatCurrency(position.value)}</p>
            </div>
          </td>

          {/* Allocation */}
          <td className="px-4 py-4">
            <div className="flex items-center space-x-2">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(position.allocation, 100)}%` }}
                />
              </div>
              <span className="text-sm font-medium text-white min-w-[3rem]">
                {position.allocation.toFixed(1)}%
              </span>
            </div>
          </td>

          {/* P&L */}
          <td className="px-4 py-4">
            <div>
              <p className={`font-medium ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(position.pnl)}
              </p>
              <div className={`flex items-center text-xs ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                {isProfitable ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {formatPercentage(position.pnlPercentage)}
              </div>
            </div>
          </td>

          {/* APR */}
          <td className="px-4 py-4">
            {position.apr ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
                {position.apr.toFixed(1)}% APR
              </span>
            ) : (
              <span className="text-gray-500 text-xs">—</span>
            )}
          </td>

          {/* Actions */}
          <td className="px-4 py-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setExpandedPosition(isExpanded ? null : position.id)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </td>
        </tr>

        {/* Expanded Row */}
        {isExpanded && (
          <tr className="bg-gray-700/30">
            <td colSpan={6} className="px-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Position Details</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Average Price:</span>
                      <span className="text-white">{formatCurrency(position.averagePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Price:</span>
                      <span className="text-white">{formatCurrency(position.asset.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">24h Change:</span>
                      <span className={position.asset.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {formatPercentage(position.asset.priceChange24h)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Pool Info</h4>
                  <div className="space-y-1 text-xs">
                    {position.poolId ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Pool ID:</span>
                          <span className="text-white font-mono">{position.poolId.slice(0, 8)}...</span>
                        </div>
                        <button className="flex items-center text-blue-400 hover:text-blue-300">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View on Explorer
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-500">No pool associated</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Actions</h4>
                  <div className="flex space-x-2">
                    {onEditPosition && (
                      <button
                        onClick={() => onEditPosition(position)}
                        className="flex items-center text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </button>
                    )}
                    {onRemovePosition && (
                      <button
                        onClick={() => onRemovePosition(position.id)}
                        className="flex items-center text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </td>
          </tr>
        )}
      </>
    );
  });

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Portfolio Positions</h3>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Portfolio Positions</h3>
        <div className="text-center py-8">
          <p className="text-gray-400">No positions found</p>
          <p className="text-sm text-gray-500 mt-2">Add your first position to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Portfolio Positions</h3>
        <p className="text-sm text-gray-400 mt-1">{positions.length} active positions</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-700/50">
            <tr>
              <SortableHeader field="symbol">Asset</SortableHeader>
              <SortableHeader field="value">Quantity / Value</SortableHeader>
              <SortableHeader field="allocation">Allocation</SortableHeader>
              <SortableHeader field="pnl">P&L</SortableHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                APR
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPositions.map((position, index) => (
              <PositionRow key={position.id} position={position} index={index} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

PositionsList.displayName = 'PositionsList';