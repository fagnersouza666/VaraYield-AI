import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertTriangle,
  Target,
  BarChart3,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { TechnicalAnalysis } from '../../services/api/technical-indicators.service';
import { useTechnicalAnalysis, useTradingSignals, useOptimalRebalancing } from '../../hooks/queries/useTechnicalAnalysis';

interface TechnicalAnalysisDashboardProps {
  poolAddresses: string[];
  portfolioData?: any;
  onTradeAction?: (analysis: TechnicalAnalysis, action: 'buy' | 'sell') => void;
}

export const TechnicalAnalysisDashboard: React.FC<TechnicalAnalysisDashboardProps> = ({
  poolAddresses,
  portfolioData,
  onTradeAction
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '4h' | '1d' | '7d'>('1d');
  const [showOnlyActionable, setShowOnlyActionable] = useState(false);

  const { data: analyses, isLoading, error } = useTechnicalAnalysis(poolAddresses);
  const { strongSignals, alerts, highConfidenceSignals } = useTradingSignals(poolAddresses);
  const { recommendations, hasHighPriorityActions } = useOptimalRebalancing(portfolioData);

  const filteredAnalyses = useMemo(() => {
    if (!analyses) return [];
    
    if (showOnlyActionable) {
      return analyses.filter(a => 
        a.overallSignal !== 'hold' && a.confidence > 60
      );
    }
    
    return analyses;
  }, [analyses, showOnlyActionable]);

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'strong_buy': return 'text-green-700 bg-green-100 border-green-300';
      case 'buy': return 'text-green-600 bg-green-50 border-green-200';
      case 'strong_sell': return 'text-red-700 bg-red-100 border-red-300';
      case 'sell': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'strong_buy': return <ArrowUpRight className=\"h-5 w-5\" />;
      case 'buy': return <TrendingUp className=\"h-5 w-5\" />;
      case 'strong_sell': return <ArrowDownRight className=\"h-5 w-5\" />;
      case 'sell': return <TrendingDown className=\"h-5 w-5\" />;
      default: return <Activity className=\"h-5 w-5\" />;
    }
  };

  const getConfidenceBarColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-500';
    if (confidence >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className=\"bg-white rounded-lg shadow-sm p-6\">
        <div className=\"animate-pulse\">
          <div className=\"h-4 bg-gray-200 rounded w-1/4 mb-4\"></div>
          <div className=\"space-y-3\">
            {[1, 2, 3].map(i => (
              <div key={i} className=\"h-20 bg-gray-200 rounded\"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className=\"bg-white rounded-lg shadow-sm p-6\">
        <div className=\"text-center text-red-600\">
          <AlertTriangle className=\"h-12 w-12 mx-auto mb-4\" />
          <p>Erro ao carregar análise técnica</p>
        </div>
      </div>
    );
  }

  return (
    <div className=\"space-y-6\">
      {/* Header e Controles */}
      <div className=\"bg-white rounded-lg shadow-sm p-4\">
        <div className=\"flex items-center justify-between mb-4\">
          <h2 className=\"text-lg font-semibold text-gray-900\">Análise Técnica</h2>
          <div className=\"flex items-center space-x-4\">
            {/* Timeframe Selector */}
            <div className=\"flex space-x-1 bg-gray-100 rounded-lg p-1\">
              {(['1h', '4h', '1d', '7d'] as const).map(timeframe => (
                <button
                  key={timeframe}
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    selectedTimeframe === timeframe
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {timeframe}
                </button>
              ))}
            </div>
            
            {/* Filter Toggle */}
            <label className=\"flex items-center space-x-2 text-sm\">
              <input
                type=\"checkbox\"
                checked={showOnlyActionable}
                onChange={(e) => setShowOnlyActionable(e.target.checked)}
                className=\"rounded border-gray-300\"
              />
              <span>Apenas Acionáveis</span>
            </label>
          </div>
        </div>

        {/* Summary Stats */}
        <div className=\"grid grid-cols-2 md:grid-cols-4 gap-4\">
          <div className=\"text-center\">
            <div className=\"text-2xl font-bold text-green-600\">{strongSignals.length}</div>
            <div className=\"text-sm text-gray-500\">Sinais Fortes</div>
          </div>
          <div className=\"text-center\">
            <div className=\"text-2xl font-bold text-blue-600\">{highConfidenceSignals.length}</div>
            <div className=\"text-sm text-gray-500\">Alta Confiança</div>
          </div>
          <div className=\"text-center\">
            <div className=\"text-2xl font-bold text-yellow-600\">{alerts.length}</div>
            <div className=\"text-sm text-gray-500\">Alertas Ativos</div>
          </div>
          <div className=\"text-center\">
            <div className={`text-2xl font-bold ${hasHighPriorityActions ? 'text-red-600' : 'text-gray-600'}`}>
              {recommendations.filter(r => r.urgency === 'high').length}
            </div>
            <div className=\"text-sm text-gray-500\">Ações Urgentes</div>
          </div>
        </div>
      </div>

      {/* Recomendações de Rebalanceamento */}
      {recommendations.length > 0 && (
        <div className=\"bg-white rounded-lg shadow-sm p-4\">
          <h3 className=\"text-lg font-semibold text-gray-900 mb-4\">Recomendações de Rebalanceamento</h3>
          <div className=\"space-y-3\">
            {recommendations.slice(0, 3).map((rec, index) => (
              <div key={index} className={`p-3 rounded-lg border ${
                rec.urgency === 'high' ? 'border-red-200 bg-red-50' :
                rec.urgency === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                'border-gray-200 bg-gray-50'
              }`}>
                <div className=\"flex items-center justify-between\">
                  <div>
                    <div className=\"font-medium text-sm\">{rec.poolAddress}</div>
                    <div className=\"text-xs text-gray-600\">{rec.reasoning}</div>
                  </div>
                  <div className=\"text-right\">
                    <div className=\"text-sm font-medium\">
                      {rec.currentAllocation.toFixed(1)}% → {rec.recommendedAllocation.toFixed(1)}%
                    </div>
                    <div className={`text-xs ${
                      rec.action === 'increase' ? 'text-green-600' : 
                      rec.action === 'decrease' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {rec.action === 'increase' ? '↗ Aumentar' : 
                       rec.action === 'decrease' ? '↘ Diminuir' : '→ Manter'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Análises Detalhadas */}
      <div className=\"bg-white rounded-lg shadow-sm p-4\">
        <h3 className=\"text-lg font-semibold text-gray-900 mb-4\">Análise por Pool</h3>
        <div className=\"space-y-4\">
          {filteredAnalyses.map((analysis) => (
            <div key={analysis.poolAddress} className=\"border rounded-lg p-4 hover:shadow-sm transition-shadow\">
              {/* Header do Pool */}
              <div className=\"flex items-center justify-between mb-4\">
                <div className=\"flex items-center space-x-3\">
                  <h4 className=\"font-medium text-gray-900\">{analysis.poolName}</h4>
                  <div className={`px-3 py-1 rounded-full text-xs border ${getSignalColor(analysis.overallSignal)}`}>
                    <div className=\"flex items-center space-x-1\">
                      {getSignalIcon(analysis.overallSignal)}
                      <span className=\"uppercase font-medium\">{analysis.overallSignal.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
                <div className=\"flex items-center space-x-3\">
                  {/* Confidence Bar */}
                  <div className=\"flex items-center space-x-2\">
                    <span className=\"text-xs text-gray-500\">Confiança:</span>
                    <div className=\"w-16 bg-gray-200 rounded-full h-2\">
                      <div 
                        className={`h-2 rounded-full ${getConfidenceBarColor(analysis.confidence)}`}
                        style={{ width: `${analysis.confidence}%` }}
                      ></div>
                    </div>
                    <span className=\"text-xs font-medium\">{analysis.confidence}%</span>
                  </div>
                  
                  {/* Action Buttons */}
                  {onTradeAction && analysis.confidence > 70 && (
                    <div className=\"flex space-x-2\">
                      {(analysis.overallSignal === 'buy' || analysis.overallSignal === 'strong_buy') && (
                        <button
                          onClick={() => onTradeAction(analysis, 'buy')}
                          className=\"px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700\"
                        >
                          <TrendingUp className=\"h-3 w-3 inline mr-1\" />
                          Buy
                        </button>
                      )}
                      {(analysis.overallSignal === 'sell' || analysis.overallSignal === 'strong_sell') && (
                        <button
                          onClick={() => onTradeAction(analysis, 'sell')}
                          className=\"px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700\"
                        >
                          <TrendingDown className=\"h-3 w-3 inline mr-1\" />
                          Sell
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Indicadores Técnicos */}
              <div className=\"grid grid-cols-2 md:grid-cols-4 gap-4 mb-4\">
                {/* RSI */}
                <div className=\"text-center p-3 bg-gray-50 rounded-lg\">
                  <div className=\"text-xs text-gray-500 mb-1\">RSI</div>
                  <div className={`text-lg font-bold ${
                    analysis.rsi.signal === 'oversold' ? 'text-green-600' :
                    analysis.rsi.signal === 'overbought' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {analysis.rsi.value.toFixed(0)}
                  </div>
                  <div className=\"text-xs text-gray-500\">{analysis.rsi.signal}</div>
                </div>

                {/* MACD */}
                <div className=\"text-center p-3 bg-gray-50 rounded-lg\">
                  <div className=\"text-xs text-gray-500 mb-1\">MACD</div>
                  <div className={`text-lg font-bold ${
                    analysis.macd.crossover === 'bullish' ? 'text-green-600' :
                    analysis.macd.crossover === 'bearish' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {analysis.macd.histogram.toFixed(2)}
                  </div>
                  <div className=\"text-xs text-gray-500\">{analysis.macd.crossover}</div>
                </div>

                {/* Volume */}
                <div className=\"text-center p-3 bg-gray-50 rounded-lg\">
                  <div className=\"text-xs text-gray-500 mb-1\">Volume</div>
                  <div className={`text-lg font-bold ${
                    analysis.volume.spike ? 'text-yellow-600' : 'text-gray-600'
                  }`}>
                    {analysis.volume.volumeRatio.toFixed(1)}x
                  </div>
                  <div className=\"text-xs text-gray-500\">{analysis.volume.trend}</div>
                </div>

                {/* Bollinger Bands */}
                <div className=\"text-center p-3 bg-gray-50 rounded-lg\">
                  <div className=\"text-xs text-gray-500 mb-1\">BB Position</div>
                  <div className={`text-lg font-bold ${
                    analysis.bollingerBands.position === 'above_upper' ? 'text-red-600' :
                    analysis.bollingerBands.position === 'below_lower' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {analysis.bollingerBands.position === 'above_upper' ? '↗' :
                     analysis.bollingerBands.position === 'below_lower' ? '↘' : '→'}
                  </div>
                  <div className=\"text-xs text-gray-500\">
                    {analysis.bollingerBands.squeeze ? 'Squeeze' : 'Normal'}
                  </div>
                </div>
              </div>

              {/* Entry/Exit Levels */}
              {(analysis.entryPrice || analysis.exitPrice) && (
                <div className=\"grid grid-cols-3 gap-4 p-3 bg-blue-50 rounded-lg\">
                  {analysis.entryPrice && (
                    <div className=\"text-center\">
                      <div className=\"text-xs text-gray-500\">Entry</div>
                      <div className=\"text-sm font-bold text-green-600\">
                        ${analysis.entryPrice.toFixed(2)}
                      </div>
                    </div>
                  )}
                  {analysis.stopLoss && (
                    <div className=\"text-center\">
                      <div className=\"text-xs text-gray-500\">Stop Loss</div>
                      <div className=\"text-sm font-bold text-red-600\">
                        ${analysis.stopLoss.toFixed(2)}
                      </div>
                    </div>
                  )}
                  {analysis.takeProfit && (
                    <div className=\"text-center\">
                      <div className=\"text-xs text-gray-500\">Take Profit</div>
                      <div className=\"text-sm font-bold text-green-600\">
                        ${analysis.takeProfit.toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Timestamp */}
              <div className=\"flex items-center justify-end mt-3 text-xs text-gray-500\">
                <Clock className=\"h-3 w-3 mr-1\" />
                {new Date(analysis.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>

        {filteredAnalyses.length === 0 && (
          <div className=\"text-center py-8 text-gray-500\">
            <BarChart3 className=\"h-12 w-12 mx-auto mb-2 opacity-50\" />
            <p>Nenhuma análise disponível</p>
          </div>
        )}
      </div>
    </div>
  );
};