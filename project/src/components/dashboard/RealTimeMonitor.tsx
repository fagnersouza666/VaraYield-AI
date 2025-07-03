import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Activity, TrendingUp, TrendingDown, Zap, CheckCircle, XCircle, Clock } from 'lucide-react';
import { MarketEvent, PerformanceMetrics, SystemHealth } from '../../services/api/real-time-monitor.service';

interface RealTimeMonitorProps {
  onEventAction?: (event: MarketEvent) => void;
}

export const RealTimeMonitor: React.FC<RealTimeMonitorProps> = ({ onEventAction }) => {
  const [events, setEvents] = useState<MarketEvent[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  // Simula conexão com serviço de monitoramento
  useEffect(() => {
    const eventInterval = setInterval(() => {
      // Simula novos eventos baseado no bot HFT
      if (Math.random() > 0.7) {
        const newEvent: MarketEvent = {
          id: `event_${Date.now()}`,
          type: ['price_spike', 'volume_surge', 'apy_change'][Math.floor(Math.random() * 3)] as any,
          severity: ['info', 'warning', 'critical'][Math.floor(Math.random() * 3)] as any,
          poolAddress: `pool_${Math.floor(Math.random() * 5)}`,
          poolName: ['SOL-USDC', 'RAY-SOL', 'mSOL-SOL', 'USDC-USDT', 'SRM-SOL'][Math.floor(Math.random() * 5)],
          newValue: Math.random() * 1000000,
          changePercent: (Math.random() - 0.5) * 100,
          timestamp: Date.now(),
          message: `Evento detectado: ${Math.random() > 0.5 ? 'Oportunidade' : 'Alerta'} de mercado`,
          actionable: Math.random() > 0.5
        };
        
        setEvents(prev => [newEvent, ...prev.slice(0, 49)]); // Mantém últimos 50
      }
    }, 5000);

    const metricsInterval = setInterval(() => {
      setMetrics({
        totalTransactions: Math.floor(Math.random() * 1000),
        successRate: Math.random() * 10 + 90,
        averageLatency: Math.random() * 200 + 50,
        errorRate: Math.random() * 5,
        totalVolume: Math.random() * 10000000,
        totalFees: Math.random() * 10000,
        profitLoss: (Math.random() - 0.3) * 50000,
        timestamp: Date.now()
      });

      setSystemHealth({
        rpcStatus: Math.random() > 0.8 ? 'degraded' : 'healthy',
        averageResponseTime: Math.random() * 300 + 50,
        activeConnections: Math.floor(Math.random() * 10) + 1,
        errorCount: Math.floor(Math.random() * 5),
        lastSuccessfulCall: Date.now() - Math.random() * 10000,
        endpointMetrics: [
          {
            endpoint: 'Solana Mainnet',
            status: Math.random() > 0.2 ? 'online' : 'offline',
            latency: Math.random() * 200 + 50,
            successRate: Math.random() * 20 + 80
          },
          {
            endpoint: 'Ankr RPC',
            status: Math.random() > 0.1 ? 'online' : 'offline',
            latency: Math.random() * 300 + 100,
            successRate: Math.random() * 30 + 70
          }
        ]
      });
    }, 10000);

    return () => {
      clearInterval(eventInterval);
      clearInterval(metricsInterval);
    };
  }, []);

  const handleEventAction = useCallback((event: MarketEvent) => {
    if (onEventAction) {
      onEventAction(event);
    }
  }, [onEventAction]);

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.severity === filter;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className=\"h-4 w-4\" />;
      case 'warning': return <TrendingDown className=\"h-4 w-4\" />;
      case 'info': return <TrendingUp className=\"h-4 w-4\" />;
      default: return <Activity className=\"h-4 w-4\" />;
    }
  };

  return (
    <div className=\"space-y-6\">
      {/* Header com Status do Sistema */}
      <div className=\"bg-white rounded-lg shadow-sm p-4\">
        <div className=\"flex items-center justify-between mb-4\">
          <h2 className=\"text-lg font-semibold text-gray-900\">Monitor em Tempo Real</h2>
          <div className=\"flex items-center space-x-4\">
            <div className=\"flex items-center space-x-2\">
              {isConnected ? (
                <>
                  <CheckCircle className=\"h-5 w-5 text-green-500\" />
                  <span className=\"text-sm text-green-600\">Conectado</span>
                </>
              ) : (
                <>
                  <XCircle className=\"h-5 w-5 text-red-500\" />
                  <span className=\"text-sm text-red-600\">Desconectado</span>
                </>
              )}
            </div>
            {systemHealth && (
              <div className=\"flex items-center space-x-2\">
                <Activity className=\"h-4 w-4 text-gray-500\" />
                <span className=\"text-sm text-gray-600\">
                  {systemHealth.averageResponseTime.toFixed(0)}ms
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Métricas de Performance */}
        {metrics && (
          <div className=\"grid grid-cols-2 md:grid-cols-4 gap-4 mb-4\">
            <div className=\"text-center\">
              <div className=\"text-2xl font-bold text-gray-900\">{metrics.totalTransactions}</div>
              <div className=\"text-sm text-gray-500\">Transações</div>
            </div>
            <div className=\"text-center\">
              <div className=\"text-2xl font-bold text-green-600\">{metrics.successRate.toFixed(1)}%</div>
              <div className=\"text-sm text-gray-500\">Taxa de Sucesso</div>
            </div>
            <div className=\"text-center\">
              <div className=\"text-2xl font-bold text-blue-600\">{metrics.averageLatency.toFixed(0)}ms</div>
              <div className=\"text-sm text-gray-500\">Latência Média</div>
            </div>
            <div className=\"text-center\">
              <div className={`text-2xl font-bold ${metrics.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.profitLoss >= 0 ? '+' : ''}${metrics.profitLoss.toFixed(0)}
              </div>
              <div className=\"text-sm text-gray-500\">P&L</div>
            </div>
          </div>
        )}

        {/* Status dos Endpoints */}
        {systemHealth && (
          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
            {systemHealth.endpointMetrics.map((endpoint, index) => (
              <div key={index} className=\"flex items-center justify-between p-3 bg-gray-50 rounded-lg\">
                <div className=\"flex items-center space-x-2\">
                  {endpoint.status === 'online' ? (
                    <CheckCircle className=\"h-4 w-4 text-green-500\" />
                  ) : (
                    <XCircle className=\"h-4 w-4 text-red-500\" />
                  )}
                  <span className=\"text-sm font-medium\">{endpoint.endpoint}</span>
                </div>
                <div className=\"flex items-center space-x-3 text-xs text-gray-500\">
                  <span>{endpoint.latency.toFixed(0)}ms</span>
                  <span>{endpoint.successRate.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filtros de Eventos */}
      <div className=\"bg-white rounded-lg shadow-sm p-4\">
        <div className=\"flex items-center justify-between mb-4\">
          <h3 className=\"text-lg font-semibold text-gray-900\">Eventos de Mercado</h3>
          <div className=\"flex space-x-2\">
            {['all', 'critical', 'warning', 'info'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType as any)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  filter === filterType
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {filterType === 'all' ? 'Todos' : filterType}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Eventos */}
        <div className=\"space-y-3 max-h-96 overflow-y-auto\">
          {filteredEvents.length === 0 ? (
            <div className=\"text-center py-8 text-gray-500\">
              <Activity className=\"h-12 w-12 mx-auto mb-2 opacity-50\" />
              <p>Nenhum evento encontrado</p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div
                key={event.id}
                className={`p-4 rounded-lg border transition-all hover:shadow-sm ${getSeverityColor(event.severity)}`}
              >
                <div className=\"flex items-start justify-between\">
                  <div className=\"flex items-start space-x-3\">
                    {getSeverityIcon(event.severity)}
                    <div className=\"flex-1 min-w-0\">
                      <div className=\"flex items-center space-x-2 mb-1\">
                        <span className=\"text-sm font-medium\">{event.poolName}</span>
                        <span className=\"px-2 py-1 text-xs bg-white rounded-full opacity-75\">
                          {event.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className=\"text-sm mb-2\">{event.message}</p>
                      <div className=\"flex items-center space-x-4 text-xs opacity-75\">
                        <div className=\"flex items-center space-x-1\">
                          <Clock className=\"h-3 w-3\" />
                          <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                        </div>
                        {event.changePercent && (
                          <span className={event.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {event.changePercent >= 0 ? '+' : ''}{event.changePercent.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {event.actionable && (
                    <button
                      onClick={() => handleEventAction(event)}
                      className=\"px-3 py-1 text-xs bg-white hover:bg-opacity-80 rounded-full border transition-colors\"
                    >
                      <Zap className=\"h-3 w-3 inline mr-1\" />
                      Ação
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};