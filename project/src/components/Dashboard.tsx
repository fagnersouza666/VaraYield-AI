import React from 'react';
import { useRaydiumData } from '../hooks/useRaydiumData';
import { useAppStore } from '../store/useAppStore';
import { logger } from '../shared/logger';
import StatsOverview from './dashboard/StatsOverview';
import RiskSelector from './dashboard/RiskSelector';
import ProtocolPerformance from './dashboard/ProtocolPerformance';
import OptimizationStatus from './dashboard/OptimizationStatus';

const Dashboard: React.FC = () => {
  const { portfolioData, loading, optimizePortfolio } = useRaydiumData();
  const { 
    riskLevel, 
    setRiskLevel, 
    isOptimizing, 
    setOptimizing, 
    lastOptimizationTime, 
    nextRebalanceTime, 
    updateOptimizationTimes 
  } = useAppStore();
  
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <StatsOverview portfolioData={portfolioData} />
        <RiskSelector 
          currentRiskLevel={riskLevel}
          onRiskLevelChange={setRiskLevel}
        />
      </div>
      
      <ProtocolPerformance portfolioData={portfolioData} />
      
      <OptimizationStatus
        lastOptimizationTime={lastOptimizationTime}
        nextRebalanceTime={nextRebalanceTime}
        isOptimizing={isOptimizing}
        loading={loading}
        onOptimize={handleOptimize}
      />
    </div>
  );
};

export default Dashboard;