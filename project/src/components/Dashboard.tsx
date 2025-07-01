import React, { useCallback } from 'react';
import { useRaydiumDashboard } from '../hooks/queries/useRaydium';
import { useAppStore } from '../store/useAppStore';
import { logger } from '../shared/logger';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import StatsOverview from './dashboard/StatsOverview';
import RiskSelector from './dashboard/RiskSelector';
import ProtocolPerformance from './dashboard/ProtocolPerformance';
import OptimizationStatus from './dashboard/OptimizationStatus';

const Dashboard: React.FC = React.memo(() => {
  const { 
    riskLevel, 
    setRiskLevel, 
    lastOptimizationTime, 
    nextRebalanceTime, 
    updateOptimizationTimes 
  } = useAppStore();

  const {
    portfolioData,
    isLoading,
    error,
    optimizePortfolio,
    isOptimizing,
  } = useRaydiumDashboard(riskLevel);
  
  const handleOptimize = useCallback(async (): Promise<void> => {
    try {
      logger.info('User initiated portfolio optimization');
      
      const result = await optimizePortfolio();
      if (result) {
        updateOptimizationTimes(result.optimizedAt, result.nextRebalanceAt);
        logger.info('Portfolio optimization completed successfully');
      }
    } catch (error) {
      logger.error('Portfolio optimization failed', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error; // Re-throw to let React Query handle it
    }
  }, [optimizePortfolio, updateOptimizationTimes]);

  const handleRiskLevelChange = useCallback((level: typeof riskLevel) => {
    setRiskLevel(level);
  }, [setRiskLevel]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorMessage
          error={error}
          title="Dashboard Error"
          onRetry={() => window.location.reload()}
          showDetails={true}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <StatsOverview portfolioData={portfolioData} />
        <RiskSelector 
          currentRiskLevel={riskLevel}
          onRiskLevelChange={handleRiskLevelChange}
        />
      </div>
      
      <ProtocolPerformance portfolioData={portfolioData} />
      
      <OptimizationStatus
        lastOptimizationTime={lastOptimizationTime}
        nextRebalanceTime={nextRebalanceTime}
        isOptimizing={isOptimizing}
        loading={isLoading}
        onOptimize={handleOptimize}
      />
    </div>
  );
});

export default Dashboard;