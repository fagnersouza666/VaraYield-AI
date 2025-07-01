import React, { useCallback, useState } from 'react';
import { Plus, RefreshCw, Settings } from 'lucide-react';
import { usePortfolioDashboard, useRemovePosition } from '../hooks/queries/usePortfolio';
import { ErrorMessage } from './ui/ErrorMessage';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { PortfolioOverview } from './portfolio/PortfolioOverview';
import { AssetAllocation } from './portfolio/AssetAllocation';
import { PositionsList } from './portfolio/PositionsList';
import { Position } from '../services/types/portfolio.types';

const Portfolio: React.FC = React.memo(() => {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [showAddPosition, setShowAddPosition] = useState(false);

  const {
    portfolio,
    isLoading,
    portfolioError,
    refetchAll,
  } = usePortfolioDashboard();

  const removePositionMutation = useRemovePosition();

  const handleRefresh = useCallback(() => {
    refetchAll();
  }, [refetchAll]);

  const handleEditPosition = useCallback((position: Position) => {
    setSelectedPosition(position);
    // TODO: Open edit position modal
  }, []);

  const handleRemovePosition = useCallback(async (positionId: string) => {
    if (!window.confirm('Are you sure you want to remove this position?')) {
      return;
    }

    try {
      await removePositionMutation.mutateAsync(positionId);
    } catch (error) {
      console.error('Failed to remove position:', error);
    }
  }, [removePositionMutation]);

  const handleAddPosition = useCallback(() => {
    setShowAddPosition(true);
    // TODO: Open add position modal
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading portfolio..." />
      </div>
    );
  }

  if (portfolioError) {
    return (
      <div className="p-8">
        <ErrorMessage
          error={portfolioError}
          title="Portfolio Error"
          onRetry={handleRefresh}
          showDetails={true}
        />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="p-8">
        <ErrorMessage
          title="No Portfolio Data"
          message="Unable to load portfolio information"
          onRetry={handleRefresh}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Portfolio</h1>
          <p className="text-gray-400 mt-1">
            Track and manage your DeFi positions
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={handleAddPosition}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Position
          </button>
          
          <button className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </button>
        </div>
      </div>

      {/* Portfolio Overview */}
      <PortfolioOverview summary={portfolio.summary} />

      {/* Asset Allocation & Positions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Asset Allocation */}
        <div className="xl:col-span-1">
          <AssetAllocation positions={portfolio.positions} />
        </div>

        {/* Positions List */}
        <div className="xl:col-span-2">
          <PositionsList
            positions={portfolio.positions}
            onEditPosition={handleEditPosition}
            onRemovePosition={handleRemovePosition}
            isLoading={removePositionMutation.isPending}
          />
        </div>
      </div>

      {/* Performance & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <p className="text-gray-400 text-sm">
            Transaction history and recent changes will be displayed here.
          </p>
          {/* TODO: Add recent transactions component */}
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Chart</h3>
          <p className="text-gray-400 text-sm">
            Portfolio performance visualization will be displayed here.
          </p>
          {/* TODO: Add performance chart component */}
        </div>
      </div>

      {/* Rebalance Recommendations */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Rebalance Recommendations</h3>
        <p className="text-gray-400 text-sm">
          AI-powered portfolio optimization suggestions will be displayed here.
        </p>
        {/* TODO: Add rebalance recommendations component */}
      </div>
    </div>
  );
});

Portfolio.displayName = 'Portfolio';

export default Portfolio;