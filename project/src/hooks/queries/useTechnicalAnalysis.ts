import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { TechnicalAnalysis, PriceData } from '../../services/api/technical-indicators.service';
import { useServices } from '../../services/service-provider';

export const useTechnicalAnalysis = (poolAddresses: string[], enabled: boolean = true) => {
  const { technicalIndicatorsService } = useServices();

  return useQuery({
    queryKey: ['technical-analysis', poolAddresses],
    queryFn: () => technicalIndicatorsService.analyzePools(poolAddresses),
    enabled: enabled && poolAddresses.length > 0,
    staleTime: 30000, // 30 seconds - atualiza frequentemente como HFT
    refetchInterval: 30000, // Auto-refresh every 30s
    retry: 3,
    onError: (error) => {
      console.error('Failed to fetch technical analysis:', error);
    },
  });
};

export const useHistoricalData = (
  poolAddress: string, 
  period: '1h' | '4h' | '1d' | '7d' = '1d',
  enabled: boolean = true
) => {
  const { technicalIndicatorsService } = useServices();

  return useQuery({
    queryKey: ['historical-data', poolAddress, period],
    queryFn: () => technicalIndicatorsService.getHistoricalData(poolAddress, period),
    enabled: enabled && !!poolAddress,
    staleTime: period === '1h' ? 60000 : period === '4h' ? 240000 : 300000, // Different stale times
    refetchInterval: period === '1h' ? 60000 : period === '4h' ? 240000 : 300000,
    retry: 2,
  });
};

export const useRealTimeTechnicalAnalysis = (poolAddresses: string[]) => {
  const [analyses, setAnalyses] = useState<TechnicalAnalysis[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();
  const { technicalIndicatorsService } = useServices();

  // Simula WebSocket connection para updates em tempo real
  useEffect(() => {
    if (poolAddresses.length === 0) return;

    setIsConnected(true);
    
    // Simula updates em tempo real como o bot HFT
    const interval = setInterval(async () => {
      try {
        const newAnalyses = await technicalIndicatorsService.analyzePools(poolAddresses);
        setAnalyses(newAnalyses);
        
        // Invalida cache para forçar re-fetch
        queryClient.invalidateQueries({ queryKey: ['technical-analysis'] });
      } catch (error) {
        console.error('Real-time update failed:', error);
        setIsConnected(false);
      }
    }, 15000); // Update every 15s for real-time feel

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [poolAddresses, technicalIndicatorsService, queryClient]);

  return {
    analyses,
    isConnected,
    refresh: useCallback(async () => {
      try {
        const newAnalyses = await technicalIndicatorsService.analyzePools(poolAddresses);
        setAnalyses(newAnalyses);
      } catch (error) {
        console.error('Manual refresh failed:', error);
      }
    }, [poolAddresses, technicalIndicatorsService])
  };
};

export const useTradingSignals = (poolAddresses: string[]) => {
  const { data: analyses, isLoading, error } = useTechnicalAnalysis(poolAddresses);
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    poolAddress: string;
    poolName: string;
    signal: string;
    confidence: number;
    message: string;
    timestamp: number;
    actionable: boolean;
  }>>([]);

  // Processa sinais de trading baseado nos indicadores
  useEffect(() => {
    if (!analyses) return;

    const newAlerts = analyses
      .filter(analysis => 
        analysis.overallSignal === 'strong_buy' || 
        analysis.overallSignal === 'strong_sell' ||
        analysis.confidence > 80
      )
      .map(analysis => ({
        id: `signal_${analysis.poolAddress}_${Date.now()}`,
        poolAddress: analysis.poolAddress,
        poolName: analysis.poolName,
        signal: analysis.overallSignal,
        confidence: analysis.confidence,
        message: generateSignalMessage(analysis),
        timestamp: analysis.timestamp,
        actionable: analysis.confidence > 70
      }));

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev.slice(0, 19)]); // Keep last 20 alerts
    }
  }, [analyses]);

  return {
    signals: analyses,
    alerts,
    strongSignals: analyses?.filter(a => 
      a.overallSignal === 'strong_buy' || a.overallSignal === 'strong_sell'
    ) || [],
    highConfidenceSignals: analyses?.filter(a => a.confidence > 80) || [],
    isLoading,
    error
  };
};

const generateSignalMessage = (analysis: TechnicalAnalysis): string => {
  const { overallSignal, confidence, rsi, macd, volume } = analysis;
  
  let message = `${analysis.poolName}: `;
  
  switch (overallSignal) {
    case 'strong_buy':
      message += `🚀 STRONG BUY signal (${confidence}% confidence)`;
      break;
    case 'buy':
      message += `📈 Buy signal (${confidence}% confidence)`;
      break;
    case 'strong_sell':
      message += `🔻 STRONG SELL signal (${confidence}% confidence)`;
      break;
    case 'sell':
      message += `📉 Sell signal (${confidence}% confidence)`;
      break;
    default:
      message += `➡️ Hold signal (${confidence}% confidence)`;
  }
  
  // Adiciona detalhes dos indicadores
  const details = [];
  if (rsi.signal !== 'neutral') details.push(`RSI: ${rsi.signal}`);
  if (macd.crossover !== 'none') details.push(`MACD: ${macd.crossover}`);
  if (volume.spike) details.push('Volume spike detected');
  
  if (details.length > 0) {
    message += ` - ${details.join(', ')}`;
  }
  
  return message;
};

export const useOptimalRebalancing = (portfolioData: any) => {
  const [rebalanceRecommendations, setRebalanceRecommendations] = useState<Array<{
    poolAddress: string;
    currentAllocation: number;
    recommendedAllocation: number;
    action: 'increase' | 'decrease' | 'maintain';
    reasoning: string;
    urgency: 'low' | 'medium' | 'high';
  }>>([]);

  const { data: analyses } = useTechnicalAnalysis(
    portfolioData?.positions?.map((p: any) => p.poolAddress) || []
  );

  useEffect(() => {
    if (!analyses || !portfolioData) return;

    const recommendations = analyses.map(analysis => {
      const position = portfolioData.positions?.find(
        (p: any) => p.poolAddress === analysis.poolAddress
      );
      
      if (!position) return null;

      const currentAllocation = position.value / portfolioData.totalValue * 100;
      let recommendedAllocation = currentAllocation;
      let action: 'increase' | 'decrease' | 'maintain' = 'maintain';
      let reasoning = 'No significant signals detected';
      let urgency: 'low' | 'medium' | 'high' = 'low';

      // Lógica de rebalanceamento baseada nos sinais técnicos
      if (analysis.overallSignal === 'strong_buy' && analysis.confidence > 80) {
        recommendedAllocation = Math.min(40, currentAllocation * 1.5); // Max 40%
        action = 'increase';
        reasoning = `Strong buy signal with ${analysis.confidence}% confidence`;
        urgency = 'high';
      } else if (analysis.overallSignal === 'strong_sell' && analysis.confidence > 80) {
        recommendedAllocation = Math.max(5, currentAllocation * 0.5); // Min 5%
        action = 'decrease';
        reasoning = `Strong sell signal with ${analysis.confidence}% confidence`;
        urgency = 'high';
      } else if (analysis.overallSignal === 'buy' && analysis.confidence > 70) {
        recommendedAllocation = Math.min(30, currentAllocation * 1.2);
        action = 'increase';
        reasoning = `Buy signal detected`;
        urgency = 'medium';
      } else if (analysis.overallSignal === 'sell' && analysis.confidence > 70) {
        recommendedAllocation = Math.max(10, currentAllocation * 0.8);
        action = 'decrease';
        reasoning = `Sell signal detected`;
        urgency = 'medium';
      }

      return {
        poolAddress: analysis.poolAddress,
        currentAllocation,
        recommendedAllocation,
        action,
        reasoning,
        urgency
      };
    }).filter(Boolean);

    setRebalanceRecommendations(recommendations as any[]);
  }, [analyses, portfolioData]);

  return {
    recommendations: rebalanceRecommendations,
    hasHighPriorityActions: rebalanceRecommendations.some(r => r.urgency === 'high'),
    totalRecommendations: rebalanceRecommendations.length
  };
};