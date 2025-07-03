import React, { useState, useEffect } from 'react';
import { TechnicalAnalysisDashboard } from '../../components/dashboard/TechnicalAnalysisDashboard';
import { RealTimeMonitor } from '../../components/dashboard/RealTimeMonitor';
import { TrendingUp, BarChart3, Shield, Activity, Settings, Zap } from 'lucide-react';
import { TechnicalAnalysis } from '../../services/api/technical-indicators.service';
import { MarketEvent } from '../../services/api/real-time-monitor.service';
import { useTechnicalAnalysis } from '../../hooks/queries/useTechnicalAnalysis';
import { useAdvancedRiskManagerService } from '../../services/service-provider';

export const AdvancedAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'technical' | 'realtime' | 'risk' | 'performance'>('technical');
  const [selectedPools, setSelectedPools] = useState([
    'pool_sol_usdc',
    'pool_ray_sol', 
    'pool_msol_sol',
    'pool_usdc_usdt'
  ]);
  const [portfolioData, setPortfolioData] = useState(null);
  
  const riskManagerService = useAdvancedRiskManagerService();
  const [riskMetrics, setRiskMetrics] = useState<any>(null);
  const [riskAlerts, setRiskAlerts] = useState<any[]>([]);

  // Load portfolio data (mock for now)
  useEffect(() => {
    const mockPortfolio = {
      totalValue: 100000,
      positions: [
        { poolAddress: 'pool_sol_usdc', value: 40000, allocation: 40 },
        { poolAddress: 'pool_ray_sol', value: 30000, allocation: 30 },
        { poolAddress: 'pool_msol_sol', value: 20000, allocation: 20 },
        { poolAddress: 'pool_usdc_usdt', value: 10000, allocation: 10 },
      ]
    };
    setPortfolioData(mockPortfolio);
  }, []);

  // Load risk data
  useEffect(() => {
    const loadRiskData = async () => {
      try {
        const [metrics, alerts] = await Promise.all([
          riskManagerService.calculateRiskMetrics(selectedPools),
          riskManagerService.monitorRiskAlerts()
        ]);
        setRiskMetrics(metrics);
        setRiskAlerts(alerts);
      } catch (error) {
        console.error('Failed to load risk data:', error);
      }
    };

    loadRiskData();
    const interval = setInterval(loadRiskData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [selectedPools, riskManagerService]);

  const handleTradeAction = (analysis: TechnicalAnalysis, action: 'buy' | 'sell') => {
    console.log(`${action.toUpperCase()} action for ${analysis.poolName}:`, analysis);
    // Aqui implementaria a lógica de trading real
    alert(`${action.toUpperCase()} signal for ${analysis.poolName} with ${analysis.confidence}% confidence`);
  };

  const handleMarketEvent = (event: MarketEvent) => {
    console.log('Market event:', event);
    // Aqui implementaria ações baseadas nos eventos de mercado
    if (event.actionable) {
      alert(`Market Event: ${event.message}`);
    }
  };

  const tabs = [
    { id: 'technical', label: 'Análise Técnica', icon: TrendingUp },
    { id: 'realtime', label: 'Monitor Tempo Real', icon: Activity },
    { id: 'risk', label: 'Gestão de Risco', icon: Shield },
    { id: 'performance', label: 'Performance', icon: BarChart3 },
  ];

  return (
    <div className=\"min-h-screen bg-gray-50 p-4\">
      <div className=\"max-w-7xl mx-auto space-y-6\">
        {/* Header */}
        <div className=\"bg-white rounded-lg shadow-sm p-6\">
          <div className=\"flex items-center justify-between\">
            <div>
              <h1 className=\"text-2xl font-bold text-gray-900\">VaraYield Analytics</h1>
              <p className=\"text-gray-600 mt-1\">
                Sistema de análise avançada inspirado em trading de alta frequência
              </p>
            </div>
            <div className=\"flex items-center space-x-3\">
              <div className=\"flex items-center space-x-2 text-sm text-gray-600\">
                <div className=\"h-2 w-2 bg-green-500 rounded-full animate-pulse\"></div>
                <span>Sistema Ativo</span>
              </div>
              <button className=\"p-2 text-gray-400 hover:text-gray-600 transition-colors\">
                <Settings className=\"h-5 w-5\" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className=\"grid grid-cols-1 md:grid-cols-4 gap-4\">
          <div className=\"bg-white rounded-lg shadow-sm p-4\">
            <div className=\"flex items-center space-x-3\">
              <div className=\"p-2 bg-green-100 rounded-lg\">
                <TrendingUp className=\"h-6 w-6 text-green-600\" />
              </div>
              <div>
                <div className=\"text-2xl font-bold text-gray-900\">87%</div>
                <div className=\"text-sm text-gray-500\">Taxa de Sucesso</div>
              </div>
            </div>
          </div>
          <div className=\"bg-white rounded-lg shadow-sm p-4\">
            <div className=\"flex items-center space-x-3\">
              <div className=\"p-2 bg-blue-100 rounded-lg\">
                <Zap className=\"h-6 w-6 text-blue-600\" />
              </div>
              <div>
                <div className=\"text-2xl font-bold text-gray-900\">125ms</div>
                <div className=\"text-sm text-gray-500\">Latência Média</div>
              </div>
            </div>
          </div>
          <div className=\"bg-white rounded-lg shadow-sm p-4\">
            <div className=\"flex items-center space-x-3\">
              <div className=\"p-2 bg-yellow-100 rounded-lg\">
                <Shield className=\"h-6 w-6 text-yellow-600\" />
              </div>
              <div>
                <div className=\"text-2xl font-bold text-gray-900\">{riskAlerts.length}</div>
                <div className=\"text-sm text-gray-500\">Alertas de Risco</div>
              </div>
            </div>
          </div>
          <div className=\"bg-white rounded-lg shadow-sm p-4\">
            <div className=\"flex items-center space-x-3\">
              <div className=\"p-2 bg-purple-100 rounded-lg\">
                <BarChart3 className=\"h-6 w-6 text-purple-600\" />
              </div>
              <div>
                <div className=\"text-2xl font-bold text-green-600\">+12.4%</div>
                <div className=\"text-sm text-gray-500\">ROI Mensal</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className=\"bg-white rounded-lg shadow-sm p-1\">
          <div className=\"flex space-x-1\">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className=\"h-4 w-4\" />
                  <span className=\"font-medium\">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className=\"space-y-6\">
          {activeTab === 'technical' && (
            <TechnicalAnalysisDashboard
              poolAddresses={selectedPools}
              portfolioData={portfolioData}
              onTradeAction={handleTradeAction}
            />
          )}

          {activeTab === 'realtime' && (
            <RealTimeMonitor onEventAction={handleMarketEvent} />
          )}

          {activeTab === 'risk' && (
            <div className=\"space-y-6\">
              {/* Risk Metrics */}
              {riskMetrics && (
                <div className=\"bg-white rounded-lg shadow-sm p-6\">
                  <h3 className=\"text-lg font-semibold text-gray-900 mb-4\">Métricas de Risco</h3>
                  <div className=\"grid grid-cols-2 md:grid-cols-5 gap-4\">
                    <div className=\"text-center p-4 bg-gray-50 rounded-lg\">
                      <div className=\"text-2xl font-bold text-gray-900\">
                        {(riskMetrics.volatility * 100).toFixed(1)}%
                      </div>
                      <div className=\"text-sm text-gray-500\">Volatilidade</div>
                    </div>
                    <div className=\"text-center p-4 bg-gray-50 rounded-lg\">
                      <div className=\"text-2xl font-bold text-gray-900\">
                        {(riskMetrics.maxDrawdown * 100).toFixed(1)}%
                      </div>
                      <div className=\"text-sm text-gray-500\">Max Drawdown</div>
                    </div>
                    <div className=\"text-center p-4 bg-gray-50 rounded-lg\">
                      <div className=\"text-2xl font-bold text-green-600\">
                        {riskMetrics.sharpeRatio.toFixed(2)}
                      </div>
                      <div className=\"text-sm text-gray-500\">Sharpe Ratio</div>
                    </div>
                    <div className=\"text-center p-4 bg-gray-50 rounded-lg\">
                      <div className=\"text-2xl font-bold text-blue-600\">
                        ${(riskMetrics.liquidityDepth / 1000000).toFixed(1)}M
                      </div>
                      <div className=\"text-sm text-gray-500\">Liquidez</div>
                    </div>
                    <div className=\"text-center p-4 bg-gray-50 rounded-lg\">
                      <div className={`text-2xl font-bold ${
                        riskMetrics.concentrationRisk > 0.7 ? 'text-red-600' : 
                        riskMetrics.concentrationRisk > 0.4 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {(riskMetrics.concentrationRisk * 100).toFixed(0)}%
                      </div>
                      <div className=\"text-sm text-gray-500\">Concentração</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Risk Alerts */}
              <div className=\"bg-white rounded-lg shadow-sm p-6\">
                <h3 className=\"text-lg font-semibold text-gray-900 mb-4\">Alertas de Risco</h3>
                <div className=\"space-y-3\">
                  {riskAlerts.length === 0 ? (
                    <div className=\"text-center py-8 text-gray-500\">
                      <Shield className=\"h-12 w-12 mx-auto mb-2 opacity-50\" />
                      <p>Nenhum alerta de risco ativo</p>
                    </div>
                  ) : (
                    riskAlerts.map(alert => (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-lg border ${
                          alert.severity === 'critical' ? 'border-red-200 bg-red-50' :
                          alert.severity === 'high' ? 'border-orange-200 bg-orange-50' :
                          alert.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                          'border-blue-200 bg-blue-50'
                        }`}
                      >
                        <div className=\"flex items-center justify-between\">
                          <div>
                            <div className=\"font-medium text-sm\">{alert.message}</div>
                            <div className=\"text-xs text-gray-600 mt-1\">{alert.recommendation}</div>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            alert.severity === 'critical' ? 'bg-red-200 text-red-800' :
                            alert.severity === 'high' ? 'bg-orange-200 text-orange-800' :
                            alert.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-blue-200 text-blue-800'
                          }`}>
                            {alert.severity}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className=\"bg-white rounded-lg shadow-sm p-6\">
              <h3 className=\"text-lg font-semibold text-gray-900 mb-4\">Análise de Performance</h3>
              <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
                <div className=\"space-y-4\">
                  <h4 className=\"font-medium text-gray-900\">Métricas de Trading</h4>
                  <div className=\"space-y-3\">
                    <div className=\"flex justify-between items-center p-3 bg-gray-50 rounded-lg\">
                      <span className=\"text-sm text-gray-600\">Win Rate</span>
                      <span className=\"font-bold text-green-600\">87.3%</span>
                    </div>
                    <div className=\"flex justify-between items-center p-3 bg-gray-50 rounded-lg\">
                      <span className=\"text-sm text-gray-600\">Average Trade Duration</span>
                      <span className=\"font-bold text-gray-900\">4.2h</span>
                    </div>
                    <div className=\"flex justify-between items-center p-3 bg-gray-50 rounded-lg\">
                      <span className=\"text-sm text-gray-600\">Max Consecutive Wins</span>
                      <span className=\"font-bold text-green-600\">12</span>
                    </div>
                    <div className=\"flex justify-between items-center p-3 bg-gray-50 rounded-lg\">
                      <span className=\"text-sm text-gray-600\">Best Trade</span>
                      <span className=\"font-bold text-green-600\">+34.7%</span>
                    </div>
                  </div>
                </div>
                <div className=\"space-y-4\">
                  <h4 className=\"font-medium text-gray-900\">Métricas do Sistema</h4>
                  <div className=\"space-y-3\">
                    <div className=\"flex justify-between items-center p-3 bg-gray-50 rounded-lg\">
                      <span className=\"text-sm text-gray-600\">Uptime</span>
                      <span className=\"font-bold text-green-600\">99.7%</span>
                    </div>
                    <div className=\"flex justify-between items-center p-3 bg-gray-50 rounded-lg\">
                      <span className=\"text-sm text-gray-600\">Signals Generated</span>
                      <span className=\"font-bold text-gray-900\">1,247</span>
                    </div>
                    <div className=\"flex justify-between items-center p-3 bg-gray-50 rounded-lg\">
                      <span className=\"text-sm text-gray-600\">Avg Response Time</span>
                      <span className=\"font-bold text-blue-600\">125ms</span>
                    </div>
                    <div className=\"flex justify-between items-center p-3 bg-gray-50 rounded-lg\">
                      <span className=\"text-sm text-gray-600\">Error Rate</span>
                      <span className=\"font-bold text-gray-900\">0.3%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};