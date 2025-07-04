import React, { useCallback } from 'react';
import { TrendingUp } from 'lucide-react';
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
    // Se for erro de dados não disponíveis, mostra placeholder em vez de erro
    const isNoDataError = error?.message?.includes('not available - waiting for real API');
    
    if (isNoDataError) {
      return (
        <div className="space-y-8">
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <div className="text-yellow-500 mb-4">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Aguardando Conexão com Dados de Mercado</h2>
            <p className="text-gray-400 mb-6">
              O dashboard será populado automaticamente quando conectado a APIs reais do Raydium
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
              <div className="p-3 bg-gray-700 rounded-lg">
                <div className="font-medium mb-1">Pools Data</div>
                <div>Informações de liquidez</div>
              </div>
              <div className="p-3 bg-gray-700 rounded-lg">
                <div className="font-medium mb-1">APY Real-time</div>
                <div>Rendimentos atualizados</div>
              </div>
              <div className="p-3 bg-gray-700 rounded-lg">
                <div className="font-medium mb-1">Portfolio Optimization</div>
                <div>Otimização inteligente</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

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